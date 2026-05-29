import { getPostsByStatus } from '@/lib/db';
import { publishDraft, rejectDraft } from '@/app/editor/actions';
import {
  CheckCircle2,
  Clock,
  Edit3,
  FileText,
  PenLine,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft:
      'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    published:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  };
  return (
    <span
      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${styles[status] ?? styles.draft}`}
    >
      {status}
    </span>
  );
}

export default async function EditorDashboard() {
  const drafts = await getPostsByStatus('draft');
  const published = await getPostsByStatus('published');

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight mb-1">Editorial dashboard</h1>
        <p className="text-zinc-500">
          Review AI-generated drafts from the daily cron, edit, then publish when ready.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <div className="text-3xl font-bold tabular-nums">{drafts.length}</div>
              <div className="text-sm font-medium text-zinc-500">Awaiting review</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <div className="text-3xl font-bold tabular-nums">{published.length}</div>
              <div className="text-sm font-medium text-zinc-500">Live on site</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/50 p-6 dark:border-blue-900/50 dark:bg-blue-950/20">
          <div className="flex items-start gap-3">
            <PenLine className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
                Manual publishing
              </p>
              <p className="text-xs text-blue-700/80 dark:text-blue-300/70 leading-relaxed">
                Auto-publish is off. Every new article stays a draft until you approve it.
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-xl font-bold flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            Draft queue
          </h2>
          <Link
            href="/editor/posts"
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            View all posts →
          </Link>
        </div>

        {drafts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-14 text-center">
            <FileText className="h-10 w-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
            <p className="font-medium text-zinc-600 dark:text-zinc-400">No drafts in the queue</p>
            <p className="text-sm text-zinc-500 mt-1">
              New articles from feeds will appear here after the daily cron runs.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {drafts.map((post) => (
              <article
                key={post.id}
                className="group rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 transition-shadow hover:shadow-md"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <StatusBadge status="draft" />
                      <span className="text-xs font-medium bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-600 dark:text-zinc-300">
                        {post.genre}
                      </span>
                      <span className="text-xs text-zinc-400">{post.date}</span>
                    </div>
                    <h3 className="font-heading text-lg font-bold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {post.summary}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Link
                      href={`/editor/edit/${post.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                      Edit & review
                    </Link>
                    <form action={publishDraft}>
                      <input type="hidden" name="id" value={post.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-950/60 transition-colors"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Quick publish
                      </button>
                    </form>
                    <form action={rejectDraft}>
                      <input type="hidden" name="id" value={post.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </button>
                    </form>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {published.length > 0 && (
        <section>
          <h2 className="font-heading text-lg font-bold mb-4">Recently published</h2>
          <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden dark:border-zinc-800 dark:bg-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-800">
            {published.slice(0, 6).map((post) => (
              <div key={post.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{post.title}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {post.date} · {post.genre}
                  </p>
                </div>
                <Link
                  href={`/editor/edit/${post.id}`}
                  className="shrink-0 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Edit
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
