import { getPostsByStatus, type Post } from '@/lib/db';
import { publishDraft, rejectDraft, unpublishPost } from '@/app/editor/actions';
import { CheckCircle2, Edit3, RotateCcw, XCircle } from 'lucide-react';
import Link from 'next/link';

function StatusBadge({ status }: { status: Post['status'] }) {
  const map = {
    draft: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    published:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  };
  return (
    <span
      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${map[status]}`}
    >
      {status}
    </span>
  );
}

export default async function AllPostsPage() {
  const [drafts, published, rejected] = await Promise.all([
    getPostsByStatus('draft'),
    getPostsByStatus('published'),
    getPostsByStatus('rejected'),
  ]);

  const all = [...drafts, ...published, ...rejected];

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight mb-1">All posts</h1>
        <p className="text-zinc-500">
          {drafts.length} drafts · {published.length} published · {rejected.length} rejected
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/80">
                <th className="text-left font-semibold text-zinc-500 px-5 py-3">Title</th>
                <th className="text-left font-semibold text-zinc-500 px-5 py-3 hidden md:table-cell">
                  Genre
                </th>
                <th className="text-left font-semibold text-zinc-500 px-5 py-3">Status</th>
                <th className="text-left font-semibold text-zinc-500 px-5 py-3 hidden sm:table-cell">
                  Date
                </th>
                <th className="text-right font-semibold text-zinc-500 px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {all.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-zinc-500">
                    No posts yet.
                  </td>
                </tr>
              ) : (
                all.map((post) => (
                  <tr key={post.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                    <td className="px-5 py-4">
                      <p className="font-medium line-clamp-1 max-w-xs lg:max-w-md">{post.title}</p>
                      <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1 max-w-md md:hidden">
                        {post.genre}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-zinc-600 dark:text-zinc-400 hidden md:table-cell">
                      {post.genre}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={post.status} />
                    </td>
                    <td className="px-5 py-4 text-zinc-500 hidden sm:table-cell">{post.date}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/editor/edit/${post.id}`}
                          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          Edit
                        </Link>
                        {post.status === 'draft' && (
                          <>
                            <form action={publishDraft}>
                              <input type="hidden" name="id" value={post.id} />
                              <button
                                type="submit"
                                title="Publish"
                                className="inline-flex items-center rounded-md p-1.5 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </button>
                            </form>
                            <form action={rejectDraft}>
                              <input type="hidden" name="id" value={post.id} />
                              <button
                                type="submit"
                                title="Reject"
                                className="inline-flex items-center rounded-md p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </form>
                          </>
                        )}
                        {post.status === 'published' && (
                          <form action={unpublishPost}>
                            <input type="hidden" name="id" value={post.id} />
                            <button
                              type="submit"
                              title="Move back to draft"
                              className="inline-flex items-center rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
