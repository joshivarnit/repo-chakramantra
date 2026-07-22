import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 container mx-auto px-4 py-20 max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back home
        </Link>

        <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight mb-8 text-gradient inline-block">
          About Chakramantra
        </h1>

        <div className="prose prose-invert max-w-none text-lg text-foreground/80 leading-relaxed">
          <p>
            Chakramantra is an independent publication focused on technology, science, and global affairs.
            We write for readers who want depth without jargon — the kind of analysis that respects your intelligence
            and your time.
          </p>
          <p>
            Every article on this site goes through our editorial process: researched, rewritten in our own voice,
            fact-checked, and refined before publication. We do not republish other outlets&apos; work. What you read here
            is Chakramantra&apos;s analysis.
          </p>
          <p>
            The insight circle — our twenty-four-spoke chakra — represents how ideas connect: science feeds technology,
            geopolitics shapes markets, breakthroughs ripple outward. We follow those threads and explain them clearly.
          </p>
        </div>
      </main>

      <footer className="border-t border-white/5 bg-background py-12 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-foreground/50 text-sm">© 2026 Chakramantra. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
