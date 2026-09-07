"use client";

import React, { useState, useEffect } from 'react';

export interface PublicAPI {
  API: string;
  Description: string;
  Auth: string;
  HTTPS: boolean;
  Cors: string;
  Link: string;
  Category: string;
}

const FALLBACK_APIS: PublicAPI[] = [
  { API: "NASA Open APIs", Description: "Astronomy Picture of the Day, Mars Rover telemetry & NEO data", Auth: "apiKey", HTTPS: true, Cors: "Yes", Link: "https://api.nasa.gov", Category: "Science & Math" },
  { API: "OpenAlex", Description: "Scholarly research papers, DOIs, citation metrics & academic taxonomy", Auth: "No", HTTPS: true, Cors: "Yes", Link: "https://openalex.org", Category: "Science & Math" },
  { API: "Chess.com API", Description: "Player stats, grandmaster games, leaderboards & live telemetry", Auth: "No", HTTPS: true, Cors: "Yes", Link: "https://api.chess.com", Category: "Games & Comics" },
  { API: "CoinGecko", Description: "Live cryptocurrency prices, volume, and market cap feeds", Auth: "No", HTTPS: true, Cors: "Yes", Link: "https://api.coingecko.com", Category: "Cryptocurrency" },
  { API: "Atlas Cloud", Description: "AI API aggregation with chat completions, image & video generation", Auth: "apiKey", HTTPS: true, Cors: "Yes", Link: "https://www.atlascloud.ai", Category: "Machine Learning" },
  { API: "Bhagavad Gita API", Description: "Full Bhagavad Gita text, translations, entity search & verse narration", Auth: "OAuth", HTTPS: true, Cors: "Yes", Link: "https://bhagavadgita.io", Category: "Books" },
  { API: "AbuseIPDB", Description: "IP, domain, and URL security threat intelligence", Auth: "apiKey", HTTPS: true, Cors: "No", Link: "https://docs.abuseipdb.com", Category: "Anti-Malware" },
  { API: "Open Library", Description: "Book covers, metadata, ISBN resolving & public borrowing data", Auth: "No", HTTPS: true, Cors: "Yes", Link: "https://openlibrary.org", Category: "Books" },
];

export default function PublicApiScrollStream() {
  const [apis, setApis] = useState<PublicAPI[]>(FALLBACK_APIS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    async function loadAPIs() {
      try {
        const res = await fetch('https://public-api-lists.github.io/public-api-lists/api/all.json');
        if (res.ok) {
          const data = await res.json();
          const items: PublicAPI[] = data.entries || data || [];
          if (items.length > 0) {
            setApis(items);
            const cats = Array.from(new Set(items.map(item => item.Category))).filter(Boolean).sort();
            setCategories(['All', ...cats.slice(0, 12)]);
          }
        }
      } catch {
        // use fallback
      } finally {
        setLoading(false);
      }
    }
    loadAPIs();
  }, []);

  const filteredApis = apis.filter(item => {
    const matchesCat = selectedCategory === 'All' || item.Category === selectedCategory;
    const matchesQuery = !searchQuery || 
      item.API.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.Description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.Category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  }).slice(0, 24);

  return (
    <section className="w-full py-20 relative border-t border-white/5 bg-gradient-to-b from-[#08080c] via-[#0c0c14] to-[#08080c] overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-widest mb-3">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              Live Knowledge Telemetry
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-heading font-extrabold text-white tracking-tight">
              730+ Public APIs <span className="text-gradient">Engine</span>
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm md:text-base mt-2 max-w-xl">
              Powering Chakramantra with live open-source telemetry across AI, Science, Finance, Crypto, and Technology.
            </p>
          </div>

          {/* Search bar */}
          <div className="w-full md:w-72">
            <div className="relative">
              <input
                type="text"
                placeholder="Search APIs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all"
              />
              <span className="absolute right-3 top-2.5 text-gray-500 text-sm">🔍</span>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar scrollbar-none [-webkit-overflow-scrolling:touch] touch-pan-x">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-slate-900/60 text-gray-400 border border-white/5 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid of Public APIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApis.map((api, idx) => (
            <a
              key={idx}
              href={api.Link}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-5 rounded-2xl glass-card border border-white/5 hover:border-purple-500/30 transition-all flex flex-col justify-between no-underline"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-md truncate max-w-[150px]">
                    {api.Category}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono">
                    {api.Auth !== 'No' && <span className="bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded">{api.Auth}</span>}
                    {api.HTTPS && <span className="text-emerald-400">HTTPS</span>}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                  {api.API}
                </h3>
                <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                  {api.Description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-500 group-hover:text-purple-400 transition-colors">
                <span>Explore Endpoint</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </a>
          ))}
        </div>

        {/* Footer info banner */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-purple-900/20 via-slate-900/40 to-cyan-900/20 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <h4 className="text-sm font-bold text-white">Sourced from public-api-lists</h4>
            <p className="text-xs text-gray-400 mt-0.5">Community-maintained directory of 730+ verified free public APIs.</p>
          </div>
          <a
            href="https://github.com/public-api-lists/public-api-lists"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold rounded-xl transition-all whitespace-nowrap no-underline"
          >
            GitHub Repository ↗
          </a>
        </div>
      </div>
    </section>
  );
}
