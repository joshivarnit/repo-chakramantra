"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { FormEvent, useState } from "react";

export default function ArticlesFilter({
  genres,
  currentGenre,
  currentQuery,
}: {
  genres: string[];
  currentGenre?: string;
  currentQuery?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(currentQuery ?? "");

  function applyFilters(genre?: string, q?: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (genre) params.set("genre", genre);
    else params.delete("genre");
    if (q?.trim()) params.set("q", q.trim());
    else params.delete("q");
    const qs = params.toString();
    router.push(qs ? `/articles?${qs}` : "/articles");
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    applyFilters(currentGenre, query);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-10">
      <form onSubmit={onSubmit} className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles…"
          className="w-full rounded-lg border border-white/10 bg-background/60 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </form>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => applyFilters(undefined, query)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            !currentGenre
              ? "bg-primary/20 text-primary border border-primary/30"
              : "bg-white/5 text-foreground/60 border border-white/10 hover:border-white/20"
          }`}
        >
          All
        </button>
        {genres.map((genre) => (
          <button
            key={genre}
            type="button"
            onClick={() => applyFilters(genre, query)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              currentGenre === genre
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-white/5 text-foreground/60 border border-white/10 hover:border-white/20"
            }`}
          >
            {genre}
          </button>
        ))}
      </div>
    </div>
  );
}
