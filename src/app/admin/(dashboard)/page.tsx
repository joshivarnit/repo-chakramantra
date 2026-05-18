import { getPostsByStatus, updatePostStatus } from "@/lib/db";
import { CheckCircle2, Clock, Edit3, Eye, Trash2 } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

// Server action to publish a post directly
async function publishDraft(formData: FormData) {
  "use server";
  const id = formData.get('id') as string;
  if (id) {
    await updatePostStatus(id, 'published');
    revalidatePath('/admin');
    revalidatePath('/');
  }
}

export default async function AdminDashboard() {
  const drafts = await getPostsByStatus('draft');
  const published = await getPostsByStatus('published');

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight mb-1">Dashboard</h1>
          <p className="text-zinc-500">Welcome back. Here is your daily content report.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <div className="text-3xl font-bold">{drafts.length}</div>
              <div className="text-sm font-medium text-zinc-500">Pending Review</div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <div className="text-3xl font-bold">{published.length}</div>
              <div className="text-sm font-medium text-zinc-500">Published Posts</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Drafts Needs Review */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500"></span>
              Needs Review
            </h2>
          </div>

          {drafts.length === 0 ? (
            <div className="border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-12 text-center text-zinc-500">
              No drafts pending review today. The AI is still searching...
            </div>
          ) : (
            <div className="space-y-4">
              {drafts.map(post => (
                <div key={post.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 transition-all hover:shadow-sm">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-600 dark:text-zinc-300">
                          {post.genre}
                        </span>
                        <span className="text-xs text-zinc-500">{post.date}</span>
                      </div>
                      <h3 className="font-heading text-lg font-bold">{post.title}</h3>
                    </div>
                    <form action={publishDraft}>
                      <input type="hidden" name="id" value={post.id} />
                      <button type="submit" className="shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors">
                        Approve & Publish
                      </button>
                    </form>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 border-l-2 border-zinc-200 dark:border-zinc-700 pl-4">
                    {post.summary}
                  </p>
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/edit/${post.id}`} className="flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                      <Edit3 className="h-4 w-4" />
                      Edit Content
                    </Link>
                    <button className="flex items-center gap-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                      <Trash2 className="h-4 w-4" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recently Published */}
        <div>
          <h2 className="font-heading text-xl font-bold mb-6">Recently Published</h2>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            {published.slice(0, 5).map((post, i) => (
              <div key={post.id} className={`p-4 flex gap-3 ${i !== 0 ? 'border-t border-zinc-200 dark:border-zinc-800' : ''}`}>
                <div className="h-8 w-8 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Eye className="h-4 w-4 text-zinc-500" />
                </div>
                <div>
                  <h4 className="text-sm font-bold leading-tight mb-1 line-clamp-2">
                    <Link href={`/post/${post.id}`} className="hover:text-blue-500 transition-colors">
                      {post.title}
                    </Link>
                  </h4>
                  <div className="text-xs text-zinc-500">{post.date} &bull; {post.readTime}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
