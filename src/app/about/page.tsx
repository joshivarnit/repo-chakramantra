import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <svg className="h-6 w-6 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93" />
            </svg>
            <span className="font-heading font-bold text-xl tracking-tight">Chakramantra</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground/60">Directory</Link>
            <Link href="/about" className="transition-colors text-foreground">About</Link>
            <Link href="/admin" className="transition-colors hover:text-foreground/80 text-foreground/60">Admin</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-20 max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Directory
        </Link>
        
        <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight mb-8">
          About Chakramantra
        </h1>
        
        <div className="prose prose-zinc dark:prose-invert max-w-none text-lg text-zinc-600 dark:text-zinc-400">
          <p>
            Welcome to Chakramantra. We curate the trends and breakthrough research shaping the future of the web and technology.
          </p>
          <p>
            The internet is flooded with information, but true insights are rare. Our mission is to discover high-ranking, deeply researched articles and new research papers that are gaining traction and delivering real value. 
          </p>
          <p>
            We believe that knowledge shouldn't be locked behind complex jargon. That's why we don't just summarize—we provide detailed information with simplicity. Whether it's a dense whitepaper or a technical deep-dive, we break it down so that anyone, techie or not, can grasp the core concepts and the gist of the innovation, much like your favorite long-form journalism platforms.
          </p>
          <p>
            Every piece featured on our platform is carefully fact-checked and refined to ensure you receive only the highest signal-to-noise ratio. Think of us as your curated bridge to the future of technology—insightful, accessible, and deeply relevant.
          </p>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-background py-12 mt-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-2 mb-6">
            <svg className="h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93" />
            </svg>
            <span className="font-heading font-bold text-xl tracking-tight">Chakramantra</span>
          </div>
          <p className="text-zinc-500 text-sm">
            © 2026 Chakramantra Directory. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
