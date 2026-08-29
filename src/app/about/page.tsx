import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Cpu, Globe, Zap, Database, ShieldCheck } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";

export const metadata = {
  title: "About | Chakramantra Architecture & Vision",
  description: "Learn about Chakramantra's autonomous editorial platform, ChakraChess engine, and 730+ public API integrations.",
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#08080c] text-slate-100 selection:bg-purple-500 selection:text-white">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 md:py-32 overflow-hidden border-b border-white/5">
          {/* Ambient background glow */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-purple-600/15 to-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="container mx-auto px-4 max-w-6xl relative z-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-purple-300 transition-colors mb-8 no-underline px-3 py-1.5 rounded-lg bg-white/5 border border-white/10"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Return to Platform
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Heading & Copy */}
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold uppercase tracking-widest mb-6">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                  Independent Editorial System
                </div>

                <h1 className="font-heading text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
                  Synthesizing <span className="text-gradient">Cosmos, Code &amp; Cognition</span>
                </h1>

                <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl font-light">
                  Chakramantra is an intelligent editorial engine exploring the frontiers of artificial intelligence, theoretical physics, geopolitical strategy, and software architecture.
                </p>

                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/chess"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-600/25 transition-all no-underline flex items-center gap-2"
                  >
                    <span>♟</span> Launch ChakraChess App
                  </Link>
                  <Link
                    href="/articles"
                    className="px-6 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/15 text-slate-200 font-semibold text-sm transition-all no-underline"
                  >
                    Browse Article Index
                  </Link>
                </div>
              </div>

              {/* Right Column: 3D Chakra Visual Asset */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-72 h-72 sm:w-96 sm:h-96 rounded-3xl overflow-hidden glass-card p-4 border border-purple-500/30 shadow-2xl shadow-purple-500/20 group">
                  <div className="relative w-full h-full rounded-2xl overflow-hidden">
                    <Image
                      src="/chakra-3d-sphere.jpg"
                      alt="Chakramantra 3D Core"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Metrics Grid */}
        <section className="py-12 bg-[#050508] border-b border-white/5">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5">
                <div className="text-3xl md:text-4xl font-extrabold font-mono text-purple-400">730+</div>
                <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">Public APIs Indexed</div>
              </div>
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5">
                <div className="text-3xl md:text-4xl font-extrabold font-mono text-cyan-400">15</div>
                <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">MultiPV Engine Lines</div>
              </div>
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5">
                <div className="text-3xl md:text-4xl font-extrabold font-mono text-emerald-400">24</div>
                <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">Chakra Knowledge Nodes</div>
              </div>
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5">
                <div className="text-3xl md:text-4xl font-extrabold font-mono text-amber-400">100%</div>
                <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">Offline WASM Computing</div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Pillars Architecture */}
        <section className="py-24 relative bg-[#08080c]">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-white tracking-tight">
                Platform Architecture &amp; Pillars
              </h2>
              <p className="text-gray-400 text-sm md:text-base mt-2">
                Built with agentic workflows, Stockfish WASM, and live open telemetry.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Pillar 1 */}
              <div className="p-8 rounded-3xl glass-card border border-white/10 hover:border-purple-500/40 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Autonomous Editorial Pipeline</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Chakramantra automatically ingests primary sources across arXiv, NASA, and tech journals. Articles are summarized, fact-checked, rewritten for clarity, and formatted into Figma-grade rich text articles.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="p-8 rounded-3xl glass-card border border-white/10 hover:border-cyan-500/40 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6">
                  <Cpu className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">ChakraChess Stockfish 16 Engine</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Integrated client-side WebWorker chess suite supporting 15 MultiPV candidate moves, move strength classifications (Brilliant, Mistake, Blunder), centipawn evaluation bars, and offline play.
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="p-8 rounded-3xl glass-card border border-white/10 hover:border-emerald-500/40 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6">
                  <Database className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Public API Knowledge Telemetry</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Indexed over 730+ verified free public APIs across 48 categories from <code className="text-xs bg-slate-900 px-1.5 py-0.5 rounded text-emerald-300">public-api-lists</code>, delivering real-time data feeds as you navigate the platform.
                </p>
              </div>

              {/* Pillar 4 */}
              <div className="p-8 rounded-3xl glass-card border border-white/10 hover:border-amber-500/40 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Real-Time Supabase Dynamic Layer</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Bypasses static cache bottlenecks with server-side dynamic route revalidation, ensuring fresh articles and telemetry load instantly without build delays.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#050508] py-12">
        <div className="container mx-auto px-4 max-w-6xl text-center flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© 2026 Chakramantra. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-gray-300 transition-colors">Home</Link>
            <Link href="/chess" className="hover:text-purple-400 transition-colors">ChakraChess</Link>
            <Link href="/articles" className="hover:text-gray-300 transition-colors">Articles</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
