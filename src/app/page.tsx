import Link from "next/link";
import { ArrowRight, BookOpen, Search } from "lucide-react";
import { getPostsByStatus } from "@/lib/db";
import ChakraWheel from "@/components/ChakraWheel";
import NewsletterForm from "@/components/NewsletterForm";

export default async function Home() {
  const posts = await getPostsByStatus('published');

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full glass border-b border-white/5 supports-[backdrop-filter]:bg-background/40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <svg className="h-6 w-6 text-blue-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93" />
            </svg>
            <span className="font-heading font-bold text-lg sm:text-xl tracking-tight line-clamp-1">Chakramantra</span>
          </Link>
          <nav className="flex items-center gap-4 sm:gap-6 text-sm font-medium">
            <Link href="#latest" className="transition-colors hover:text-foreground/80 text-foreground/60 hidden sm:inline-block">Latest</Link>
            <Link href="#popular" className="transition-colors hover:text-foreground/80 text-foreground/60 hidden sm:inline-block">Trending</Link>
            <Link href="/about" className="transition-colors hover:text-foreground/80 text-foreground/60">About</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Wheel Section (New Hero) */}
        <section className="relative overflow-hidden py-16 lg:py-24 border-b border-white/5 min-h-[calc(100vh-4rem)] flex items-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none"></div>
          <div className="container relative mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24">
              {/* Left Side: Wheel */}
              <div className="relative flex justify-center w-full lg:w-1/2 order-2 lg:order-1">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[700px] sm:h-[700px] bg-accent/25 blur-[120px] rounded-full pointer-events-none"></div>
                <div className="relative scale-90 sm:scale-100 origin-center transition-transform duration-500 z-10 group">
                  <ChakraWheel size={640} posts={posts.slice(0, 10)} />
                </div>
              </div>
              
              {/* Right Side: Info Panel */}
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left w-full lg:w-1/2 order-1 lg:order-2 z-20">
                <h1 className="font-heading text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-gradient mb-6 leading-tight">
                  Chakramantra <br className="hidden sm:block" /> the insight circle
                </h1>
                <p className="text-lg sm:text-xl text-foreground/70 mb-8 max-w-lg leading-relaxed">
                  Discover high-ranking, deeply researched articles and breakthrough papers. Complex topics explained simply, without losing the details. Fact-checked and refined.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center lg:justify-start">
                  <Link href="#latest" className="inline-flex h-12 items-center justify-center rounded-md bg-foreground px-8 text-sm font-medium text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    Explore Directory <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Latest Publications */}
        <section id="latest" className="py-20 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-accent/5 via-background to-background pointer-events-none"></div>
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="font-heading text-3xl font-bold tracking-tight mb-2">Latest Additions</h2>
                <p className="text-foreground/60">The newest high-signal articles added to Chakramantra.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {posts.map((post) => (
                <div key={post.id} className="group relative rounded-2xl glass-card p-6 flex flex-col justify-between overflow-hidden">

                  {/* Subtle background glow on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/0 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                  <div className="relative z-10 flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {post.genre}
                      </span>
                      <span className="text-xs text-foreground/50">{post.readTime}</span>
                    </div>
                    {/* The Chakra Wheel */}
                    <div className="relative -top-2 -right-2 transform transition-transform duration-500 group-hover:scale-110">
                      <ChakraWheel size={75} />
                    </div>
                  </div>

                  <div className="relative z-10 flex-1">
                    <Link href={`/post/${post.id}`}>
                      <h3 className="font-heading text-xl font-bold mb-3 group-hover:text-primary transition-colors duration-300">
                        {post.title}
                      </h3>
                    </Link>
                    <p className="text-foreground/70 mb-6 line-clamp-2">
                      {post.summary}
                    </p>
                  </div>

                  <div className="relative z-10 flex items-center justify-between text-sm text-foreground/50 mt-auto">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span>{post.source}</span>
                    </div>
                    <time>{post.date}</time>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-center sm:hidden">
              <Link href="/directory" className="inline-flex items-center gap-1 text-sm font-medium text-blue-500 hover:text-blue-600">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-background py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <div className="flex items-center gap-2 mb-4">
                <svg className="h-6 w-6 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93" />
                </svg>
                <span className="font-heading font-bold text-2xl tracking-tight">Chakramantra</span>
              </div>
              <p className="text-foreground/70 max-w-sm mb-6">
                The premier directory for high-signal technical research, news, and insights.
              </p>
            </div>
            <div className="flex justify-center md:justify-end w-full">
              <NewsletterForm />
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 text-center flex flex-col items-center">
            <p className="text-foreground/50 text-sm">
              © 2026 Chakramantra Directory. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
