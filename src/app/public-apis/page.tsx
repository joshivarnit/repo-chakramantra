import { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import PublicApisCatalog from "@/components/PublicApisCatalog";

export const metadata: Metadata = {
  title: "730+ Free Public APIs Directory | Chakramantra",
  description:
    "Curated directory of 730+ free public APIs across 48 categories including AI, Machine Learning, Science, Finance, Crypto, Geocoding, and Books.",
  openGraph: {
    title: "730+ Free Public APIs Catalog | Chakramantra",
    description:
      "Explore 730+ free public APIs across 48 categories with ready-to-copy code snippets, instant testing, and live telemetry.",
    url: "https://repo-chakramantra.vercel.app/public-apis",
  },
};

export const dynamic = "force-dynamic";

export default function PublicApisPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#08080c] text-slate-100 selection:bg-purple-500 selection:text-white">
      <SiteHeader />

      <main className="flex-1">
        <PublicApisCatalog />
      </main>

      <footer className="border-t border-white/5 bg-[#050508] py-12 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
                  ☯
                </div>
                <span className="font-heading font-extrabold text-xl tracking-tight text-white">
                  Chakramantra
                </span>
              </div>
              <p className="text-gray-400 text-xs max-w-sm leading-relaxed">
                Independent platform exploring technological frontiers, open telemetry, science, and strategic dynamics.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400 font-medium">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <Link href="/articles" className="hover:text-white transition-colors">
                Articles
              </Link>
              <Link href="/public-apis" className="text-purple-400 font-semibold transition-colors">
                Public APIs
              </Link>
              <Link href="/chess" className="hover:text-purple-400 transition-colors">
                ChakraChess
              </Link>
              <Link href="/about" className="hover:text-white transition-colors">
                About
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-3">
            <p>© 2026 Chakramantra. All rights reserved.</p>
            <p>Data indexed from public-api-lists/public-api-lists</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
