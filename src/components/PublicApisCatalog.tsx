"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  ExternalLink,
  Star,
  Copy,
  Check,
  Code2,
  Sparkles,
  Filter,
  Shield,
  ShieldCheck,
  Globe,
  Database,
  ArrowRight,
  Layers,
  ChevronLeft,
  ChevronRight,
  X,
  Terminal,
  Zap,
} from 'lucide-react';

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
  { API: "NASA Open APIs", Description: "Astronomy Picture of the Day, Mars Rover telemetry, asteroids and space weather feeds.", Auth: "apiKey", HTTPS: true, Cors: "Yes", Link: "https://api.nasa.gov", Category: "Science & Math" },
  { API: "OpenAlex", Description: "Open scholarly research catalog with 250M+ papers, DOIs, authors, citations, and taxonomies.", Auth: "No", HTTPS: true, Cors: "Yes", Link: "https://openalex.org", Category: "Science & Math" },
  { API: "Chess.com API", Description: "Real-time chess player profiles, grandmaster games, tournament leaderboards, and telemetry.", Auth: "No", HTTPS: true, Cors: "Yes", Link: "https://api.chess.com", Category: "Games & Comics" },
  { API: "Lichess API", Description: "Free, open chess games, real-time board puzzles, broadcast TV, and analysis engine.", Auth: "No", HTTPS: true, Cors: "Yes", Link: "https://lichess.org/api", Category: "Games & Comics" },
  { API: "CoinGecko API", Description: "Live cryptocurrency prices, 24h trading volume, DeFi metrics, and historical market data.", Auth: "No", HTTPS: true, Cors: "Yes", Link: "https://api.coingecko.com", Category: "Cryptocurrency" },
  { API: "Atlas Cloud", Description: "High-speed AI API aggregation supporting OpenAI-compatible chat completions and image generation.", Auth: "apiKey", HTTPS: true, Cors: "Yes", Link: "https://www.atlascloud.ai", Category: "Machine Learning" },
  { API: "Bhagavad Gita API", Description: "Full Sanskrit Bhagavad Gita verses, multi-language translations, word meanings, and audio narration.", Auth: "OAuth", HTTPS: true, Cors: "Yes", Link: "https://bhagavadgita.io", Category: "Books" },
  { API: "Open Library", Description: "Comprehensive book catalog, ISBN cover artwork resolver, author bios, and public lending stats.", Auth: "No", HTTPS: true, Cors: "Yes", Link: "https://openlibrary.org", Category: "Books" },
  { API: "Hacker News Firebase", Description: "Official real-time Firebase API for top stories, ask HN, show HN, and discussion threads.", Auth: "No", HTTPS: true, Cors: "Yes", Link: "https://hacker-news.firebaseio.com/v0/", Category: "News" },
  { API: "Open-Meteo", Description: "Free weather forecast API with hourly temperatures, wind speed, solar radiation, and no API key required.", Auth: "No", HTTPS: true, Cors: "Yes", Link: "https://open-meteo.com", Category: "Weather" },
  { API: "REST Countries", Description: "Detailed country facts including capitals, currencies, border maps, population, and flags.", Auth: "No", HTTPS: true, Cors: "Yes", Link: "https://restcountries.com", Category: "Geocoding" },
  { API: "IP-API", Description: "Fast IP geolocation resolver returning ISP, country, city, and GPS coordinates without authentication.", Auth: "No", HTTPS: false, Cors: "Yes", Link: "http://ip-api.com", Category: "Geocoding" },
  { API: "PubChem API", Description: "World's largest database of chemical substances, 3D molecular structures, and biological assays.", Auth: "No", HTTPS: true, Cors: "Yes", Link: "https://pubchem.ncbi.nlm.nih.gov", Category: "Science & Math" },
  { API: "OpenTDB", Description: "User-contributed trivia database with thousands of categorized quiz questions and difficulty levels.", Auth: "No", HTTPS: true, Cors: "Yes", Link: "https://opentdb.com", Category: "Games & Comics" },
  { API: "ExchangeRate-API", Description: "Global foreign currency exchange rates with support for over 160 modern sovereign currencies.", Auth: "apiKey", HTTPS: true, Cors: "Yes", Link: "https://www.exchangerate-api.com", Category: "Finance" },
  { API: "PokéAPI", Description: "All Pokémon data including species, moves, abilities, evolution chains, and high-res sprites.", Auth: "No", HTTPS: true, Cors: "Yes", Link: "https://pokeapi.co", Category: "Anime" }
];

export default function PublicApisCatalog() {
  const [apis, setApis] = useState<PublicAPI[]>(FALLBACK_APIS);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [authFilter, setAuthFilter] = useState<string>('All');
  const [corsOnly, setCorsOnly] = useState<boolean>(false);
  const [httpsOnly, setHttpsOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'name' | 'category'>('name');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState<boolean>(false);
  const [inspectApi, setInspectApi] = useState<PublicAPI | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeSnippetTab, setActiveSnippetTab] = useState<'fetch' | 'curl' | 'python'>('fetch');

  const itemsPerPage = 24;

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('chakramantra_favorite_apis');
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleFavorite = (apiName: string) => {
    setFavorites((prev) => {
      const next = prev.includes(apiName)
        ? prev.filter((name) => name !== apiName)
        : [...prev, apiName];
      try {
        localStorage.setItem('chakramantra_favorite_apis', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Fetch full API list from repository
  useEffect(() => {
    async function loadAllApis() {
      try {
        const res = await fetch('https://public-api-lists.github.io/public-api-lists/api/all.json');
        if (res.ok) {
          const data = await res.json();
          const items = data.entries || data || [];
          if (Array.isArray(items) && items.length > 0) {
            const normalized: PublicAPI[] = items
              .filter((raw: any) => raw && (raw.API || raw.title || raw.name))
              .map((raw: any) => ({
                API: String(raw.API || raw.title || raw.name || '').trim(),
                Description: String(raw.Description || raw.description || '').trim(),
                Auth: String(raw.Auth || raw.auth || 'No').trim(),
                HTTPS: typeof raw.HTTPS === 'boolean' ? raw.HTTPS : raw.https === true || String(raw.HTTPS).toLowerCase() === 'true',
                Cors: String(raw.Cors || raw.cors || 'unknown').trim(),
                Link: String(raw.Link || raw.link || raw.url || '').trim(),
                Category: String(raw.Category || raw.category || 'General').trim(),
              }));
            setApis(normalized);
          }
        }
      } catch (err) {
        console.warn('Failed to load live APIs catalog, using fallback.', err);
      } finally {
        setLoading(false);
      }
    }
    loadAllApis();
  }, []);

  // Compute category statistics
  const categoriesWithCounts = useMemo(() => {
    const map = new Map<string, number>();
    apis.forEach((item) => {
      const cat = item.Category || 'General';
      map.set(cat, (map.get(cat) || 0) + 1);
    });
    const sorted = Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    return sorted;
  }, [apis]);

  // Filter and sort APIs
  const filteredApis = useMemo(() => {
    return apis.filter((item) => {
      const apiName = item.API || '';
      const apiDesc = item.Description || '';
      const apiCat = item.Category || '';
      const apiAuth = item.Auth || 'No';
      const apiCors = item.Cors || 'unknown';

      // Category filter
      if (selectedCategory !== 'All' && apiCat !== selectedCategory) {
        return false;
      }

      // Auth filter
      if (authFilter === 'No Auth' && apiAuth !== 'No') {
        return false;
      }
      if (authFilter === 'API Key' && !apiAuth.toLowerCase().includes('key')) {
        return false;
      }
      if (authFilter === 'OAuth' && !apiAuth.toLowerCase().includes('oauth')) {
        return false;
      }

      // CORS filter
      if (corsOnly && apiCors.toLowerCase() !== 'yes') {
        return false;
      }

      // HTTPS filter
      if (httpsOnly && !item.HTTPS) {
        return false;
      }

      // Favorites filter
      if (showOnlyFavorites && !favorites.includes(apiName)) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = apiName.toLowerCase().includes(q);
        const matchesDesc = apiDesc.toLowerCase().includes(q);
        const matchesCat = apiCat.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCat) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      const nameA = a.API || '';
      const nameB = b.API || '';
      const catA = a.Category || '';
      const catB = b.Category || '';
      if (sortBy === 'name') {
        return nameA.localeCompare(nameB);
      }
      return catA.localeCompare(catB) || nameA.localeCompare(nameB);
    });
  }, [apis, selectedCategory, authFilter, corsOnly, httpsOnly, showOnlyFavorites, favorites, searchQuery, sortBy]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, authFilter, corsOnly, httpsOnly, showOnlyFavorites, searchQuery, sortBy]);

  // Pagination slice
  const totalPages = Math.ceil(filteredApis.length / itemsPerPage) || 1;
  const paginatedApis = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredApis.slice(start, start + itemsPerPage);
  }, [filteredApis, currentPage, itemsPerPage]);

  // Quick stats
  const noAuthCount = useMemo(() => apis.filter(a => (a.Auth || '').toLowerCase() === 'no').length, [apis]);
  const corsCount = useMemo(() => apis.filter(a => (a.Cors || '').toLowerCase() === 'yes').length, [apis]);

  const copyToClipboard = (text: string, key: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const getSnippets = (api: PublicAPI) => {
    const url = api.Link;
    return {
      fetch: `// Modern JavaScript / TypeScript Fetch\nfetch('${url}', {\n  method: 'GET',\n  headers: {\n    'Accept': 'application/json'\n  }\n})\n  .then(res => res.json())\n  .then(data => console.log(data))\n  .catch(err => console.error('Fetch error:', err));`,
      curl: `# cURL Command\ncurl -X GET "${url}" \\\n  -H "Accept: application/json"`,
      python: `# Python Requests\nimport requests\n\nresponse = requests.get("${url}", headers={"Accept": "application/json"})\nif response.ok:\n    data = response.json()\n    print(data)\nelse:\n    print(f"Error: {response.status_code}")`
    };
  };

  return (
    <div className="w-full">
      {/* Hero Header */}
      <section className="relative pt-12 pb-16 border-b border-white/5 bg-gradient-to-b from-[#08080c] via-[#0d0d16] to-[#08080c] overflow-hidden">
        {/* Glow ambient spots */}
        <div className="absolute top-0 left-1/4 -translate-y-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            Live Open Telemetry Directory
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-heading font-extrabold text-white tracking-tight leading-tight">
            730+ Public APIs <span className="text-gradient">Catalog</span>
          </h1>

          <p className="text-gray-300 text-sm sm:text-base md:text-lg mt-3 max-w-2xl font-light leading-relaxed">
            Curated, community-tested public APIs spanning Artificial Intelligence, Science, Cryptography, Geocoding, Finance, and Books. Zero friction, free endpoints.
          </p>

          {/* Quick Stat Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
            <div className="glass-card p-3.5 rounded-xl border border-white/5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">{apis.length}</div>
                <div className="text-[11px] text-gray-400">Total Public APIs</div>
              </div>
            </div>

            <div className="glass-card p-3.5 rounded-xl border border-white/5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">{noAuthCount}</div>
                <div className="text-[11px] text-gray-400">No Key Needed</div>
              </div>
            </div>

            <div className="glass-card p-3.5 rounded-xl border border-white/5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">{corsCount}</div>
                <div className="text-[11px] text-gray-400">Browser CORS Ready</div>
              </div>
            </div>

            <div className="glass-card p-3.5 rounded-xl border border-white/5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">{categoriesWithCounts.length}</div>
                <div className="text-[11px] text-gray-400">Categories</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Controls */}
      <section className="py-10">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Controls Bar: Search, Auth, CORS, Favorites */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search APIs by name, keyword, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-gray-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Auth Dropdown */}
              <select
                value={authFilter}
                onChange={(e) => setAuthFilter(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-gray-300 focus:outline-none focus:border-purple-500/50 cursor-pointer"
              >
                <option value="All">All Auth Types</option>
                <option value="No Auth">No Auth (Free & Open)</option>
                <option value="API Key">API Key Required</option>
                <option value="OAuth">OAuth</option>
              </select>

              {/* CORS Toggle */}
              <button
                onClick={() => setCorsOnly(!corsOnly)}
                className={`px-3 py-2 rounded-lg border font-medium transition-all flex items-center gap-1.5 ${
                  corsOnly
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                    : 'bg-slate-900 border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>CORS Only</span>
              </button>

              {/* HTTPS Toggle */}
              <button
                onClick={() => setHttpsOnly(!httpsOnly)}
                className={`px-3 py-2 rounded-lg border font-medium transition-all flex items-center gap-1.5 ${
                  httpsOnly
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-900 border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>HTTPS Only</span>
              </button>

              {/* Favorites Toggle */}
              <button
                onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                className={`px-3 py-2 rounded-lg border font-medium transition-all flex items-center gap-1.5 ${
                  showOnlyFavorites
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-slate-900 border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>Saved ({favorites.length})</span>
              </button>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'category')}
                className="px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-gray-300 focus:outline-none focus:border-purple-500/50 cursor-pointer"
              >
                <option value="name">Sort: Name (A-Z)</option>
                <option value="category">Sort: Category</option>
              </select>
            </div>
          </div>

          {/* Category Horizontal Chips */}
          <div className="mb-8">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar [-webkit-overflow-scrolling:touch]">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCategory === 'All'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-slate-900/80 text-gray-400 border border-white/5 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>All Topics</span>
                <span className="text-[10px] opacity-75">({apis.length})</span>
              </button>

              {categoriesWithCounts.map(([cat, count]) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    selectedCategory === cat
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-semibold'
                      : 'bg-slate-900/60 text-gray-400 border border-white/5 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span>{cat}</span>
                  <span className="text-[10px] opacity-70">({count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Results Summary & Clear filter if needed */}
          <div className="flex items-center justify-between text-xs text-gray-400 mb-6">
            <div>
              Showing <span className="font-semibold text-white">{filteredApis.length}</span> endpoints
              {selectedCategory !== 'All' && <span> in <strong className="text-purple-300">{selectedCategory}</strong></span>}
              {searchQuery && <span> matching &ldquo;<strong className="text-white">{searchQuery}</strong>&rdquo;</span>}
            </div>

            {(selectedCategory !== 'All' || authFilter !== 'All' || corsOnly || httpsOnly || showOnlyFavorites || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setAuthFilter('All');
                  setCorsOnly(false);
                  setHttpsOnly(false);
                  setShowOnlyFavorites(false);
                  setSearchQuery('');
                }}
                className="text-purple-400 hover:text-purple-300 underline font-medium"
              >
                Reset filters
              </button>
            )}
          </div>

          {/* Grid of APIs */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-44 rounded-2xl glass-card animate-pulse border border-white/5 bg-slate-900/40 p-5" />
              ))}
            </div>
          ) : filteredApis.length === 0 ? (
            <div className="rounded-3xl bg-slate-900/30 border border-dashed border-white/10 py-20 text-center">
              <Database className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-300 font-semibold text-lg mb-1">No matching APIs found</p>
              <p className="text-gray-500 text-xs max-w-sm mx-auto mb-6">
                Try widening your search terms or clearing selected category and security filters.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setAuthFilter('All');
                  setCorsOnly(false);
                  setHttpsOnly(false);
                  setShowOnlyFavorites(false);
                  setSearchQuery('');
                }}
                className="px-5 py-2.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs font-bold rounded-xl transition-all"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedApis.map((api, idx) => {
                const isFav = favorites.includes(api.API);
                return (
                  <div
                    key={`${api.API}-${idx}`}
                    className="group relative rounded-2xl glass-card p-5 flex flex-col justify-between border border-white/5 hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-200"
                  >
                    <div>
                      {/* Top Meta: Category + Badges + Favorite */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[11px] font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-md truncate max-w-[140px]">
                          {api.Category}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {/* Auth indicator */}
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                              api.Auth === 'No'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                            }`}
                            title={`Authentication: ${api.Auth}`}
                          >
                            {api.Auth === 'No' ? 'Free/No Auth' : api.Auth}
                          </span>

                          {/* CORS indicator */}
                          {api.Cors?.toLowerCase() === 'yes' && (
                            <span
                              className="text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/20 px-1.5 py-0.5 rounded font-mono"
                              title="CORS Supported"
                            >
                              CORS
                            </span>
                          )}

                          {/* Favorite button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(api.API);
                            }}
                            className="p-1 rounded-md text-gray-500 hover:text-amber-400 transition-colors"
                            title={isFav ? 'Remove from saved' : 'Save to favorites'}
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${
                                isFav ? 'fill-amber-400 text-amber-400' : ''
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* API Title */}
                      <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                        {api.API}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-gray-300 mt-2 line-clamp-2 leading-relaxed">
                        {api.Description}
                      </p>
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setInspectApi(api)}
                        className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors py-1 px-2 rounded-lg bg-purple-500/10 border border-purple-500/20"
                      >
                        <Code2 className="w-3.5 h-3.5" />
                        <span>Code & Details</span>
                      </button>

                      <a
                        href={api.Link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors py-1 px-2 rounded-lg hover:bg-white/5"
                        title="Visit official API documentation"
                      >
                        <span>Visit</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/5">
              <div className="text-xs text-gray-400">
                Page <span className="text-white font-medium">{currentPage}</span> of{' '}
                <span className="text-white font-medium">{totalPages}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs font-medium text-gray-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                {/* Numbered Jump Buttons (First, Previous, Current, Next, Last) */}
                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = currentPage;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${
                          currentPage === pageNum
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'bg-slate-900 text-gray-400 hover:text-white'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs font-medium text-gray-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Open Source Credit Footer Box */}
          <div className="mt-14 p-6 rounded-2xl bg-gradient-to-r from-purple-900/20 via-slate-900/40 to-cyan-900/20 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <h4 className="text-sm font-bold text-white">Maintained by Open Source Community</h4>
              </div>
              <p className="text-xs text-gray-400 max-w-xl">
                Data dynamically fetched from <code className="text-purple-300 font-mono">public-api-lists/public-api-lists</code>. Verified endpoints updated continuously.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://github.com/public-api-lists/public-api-lists"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 no-underline"
              >
                <span>GitHub Index</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <Link
                href="/articles"
                className="px-4 py-2 bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/40 text-purple-200 text-xs font-semibold rounded-xl transition-all no-underline"
              >
                Read Articles →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* API Inspector Modal with Ready Code Snippets */}
      {inspectApi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-[#0c0c14] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-md">
                    {inspectApi.Category}
                  </span>
                  {inspectApi.Auth === 'No' ? (
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                      Free / No Auth
                    </span>
                  ) : (
                    <span className="text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded">
                      Auth: {inspectApi.Auth}
                    </span>
                  )}
                  {inspectApi.HTTPS && (
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                      HTTPS
                    </span>
                  )}
                </div>

                <h2 className="text-2xl font-heading font-extrabold text-white">
                  {inspectApi.API}
                </h2>
              </div>

              <button
                onClick={() => setInspectApi(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Description & Link */}
            <div className="py-4 space-y-3 overflow-y-auto pr-1">
              <p className="text-sm text-gray-300 leading-relaxed">
                {inspectApi.Description}
              </p>

              {/* URL with Copy */}
              <div className="flex items-center justify-between gap-2 p-3 bg-slate-900/90 rounded-xl border border-white/10 text-xs font-mono text-cyan-300 break-all">
                <span>{inspectApi.Link}</span>
                <button
                  onClick={() => copyToClipboard(inspectApi.Link, 'modal-url')}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-md text-white shrink-0 flex items-center gap-1 transition-all"
                >
                  {copiedKey === 'modal-url' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-[10px] text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span className="text-[10px]">Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Snippets Section */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Ready-to-Use Code Snippet
                    </span>
                  </div>

                  {/* Tab switches */}
                  <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-white/5 text-[11px]">
                    <button
                      onClick={() => setActiveSnippetTab('fetch')}
                      className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                        activeSnippetTab === 'fetch'
                          ? 'bg-purple-600 text-white font-semibold'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Fetch JS
                    </button>
                    <button
                      onClick={() => setActiveSnippetTab('curl')}
                      className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                        activeSnippetTab === 'curl'
                          ? 'bg-purple-600 text-white font-semibold'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      cURL
                    </button>
                    <button
                      onClick={() => setActiveSnippetTab('python')}
                      className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                        activeSnippetTab === 'python'
                          ? 'bg-purple-600 text-white font-semibold'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Python
                    </button>
                  </div>
                </div>

                <div className="relative rounded-xl bg-[#07070b] border border-white/10 p-4 font-mono text-xs text-gray-300 overflow-x-auto">
                  <pre className="whitespace-pre">{getSnippets(inspectApi)[activeSnippetTab]}</pre>
                  <button
                    onClick={() =>
                      copyToClipboard(getSnippets(inspectApi)[activeSnippetTab], 'snippet')
                    }
                    className="absolute top-3 right-3 px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[10px] flex items-center gap-1 transition-all"
                  >
                    {copiedKey === 'snippet' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3 mt-auto">
              <button
                onClick={() => toggleFavorite(inspectApi.API)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs font-semibold text-gray-300 hover:text-amber-400 flex items-center gap-1.5 transition-all"
              >
                <Star
                  className={`w-3.5 h-3.5 ${
                    favorites.includes(inspectApi.API)
                      ? 'fill-amber-400 text-amber-400'
                      : ''
                  }`}
                />
                <span>
                  {favorites.includes(inspectApi.API) ? 'Bookmarked' : 'Bookmark'}
                </span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInspectApi(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition-all"
                >
                  Close
                </button>
                <a
                  href={inspectApi.Link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 no-underline shadow-lg shadow-purple-600/30"
                >
                  <span>Open API Docs</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
