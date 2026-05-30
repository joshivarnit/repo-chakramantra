"use client";

import { useTransition } from "react";
import { Plus, Rss, Trash2 } from "lucide-react";
import {
  addFeedSourceAction,
  deleteFeedSourceAction,
  toggleFeedSourceAction,
} from "@/app/editor/actions";
import type { FeedSource } from "@/lib/feed-sources";

export default function SourcesManager({
  sources,
  error,
}: {
  sources: FeedSource[];
  error?: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    if (!confirm("Remove this feed source? The cron will stop pulling from it.")) return;
    startTransition(() => {
      deleteFeedSourceAction(id);
    });
  }

  function handleToggle(id: string, enabled: boolean) {
    startTransition(() => {
      toggleFeedSourceAction(id, enabled);
    });
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="font-heading text-lg font-semibold mb-1 flex items-center gap-2">
          <Plus className="h-5 w-5 text-blue-500" />
          Add feed source
        </h2>
        <p className="text-sm text-zinc-500 mb-5">
          Paste an RSS or Atom URL. The daily cron pulls new articles from enabled sources only.
        </p>
        <form action={addFeedSourceAction} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-xs font-medium text-zinc-500 mb-1.5">
              Display name
            </label>
            <input
              id="name"
              name="name"
              required
              placeholder="e.g. BBC World"
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-xs font-medium text-zinc-500 mb-1.5">
              Default category
            </label>
            <input
              id="category"
              name="category"
              placeholder="e.g. Technology"
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="url" className="block text-xs font-medium text-zinc-500 mb-1.5">
              RSS feed URL
            </label>
            <input
              id="url"
              name="url"
              type="url"
              required
              placeholder="https://example.com/feed.xml"
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-mono dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add source
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="font-heading text-lg font-semibold flex items-center gap-2">
            <Rss className="h-5 w-5 text-blue-500" />
            Active sources ({sources.filter((s) => s.enabled).length} of {sources.length})
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            Source names are for your editorial review only — they never appear on the public site.
          </p>
        </div>

        {sources.length === 0 ? (
          <div className="px-6 py-12 text-center text-zinc-500 text-sm">
            No feed sources yet. Add one above, or run the SQL migration to seed defaults.
          </div>
        ) : (
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {sources.map((source) => (
              <li
                key={source.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{source.name}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      {source.category}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 font-mono truncate">{source.url}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={source.enabled}
                      disabled={isPending}
                      onChange={(e) => handleToggle(source.id, e.target.checked)}
                      className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                    />
                    Enabled
                  </label>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleDelete(source.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
