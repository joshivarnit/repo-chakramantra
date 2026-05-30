import Link from 'next/link';
import { LayoutDashboard, FileText, LogOut, Sparkles, PenLine, UserCircle, Rss } from 'lucide-react';
import { signOut } from '@/app/editor/actions';
import { createClient } from '@/lib/supabase/server';

export default async function EditorLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <aside className="w-64 shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <Sparkles className="h-5 w-5 text-blue-500 shrink-0" />
            <span className="font-heading font-bold text-lg tracking-tight text-foreground truncate">
              Chakramantra
            </span>
          </Link>
        </div>

        {user?.email && (
          <div className="mx-3 mt-4 rounded-lg border border-emerald-200/80 bg-emerald-50 px-3 py-2.5 dark:border-emerald-900/50 dark:bg-emerald-950/30">
            <div className="flex items-start gap-2">
              <UserCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700/80 dark:text-emerald-400/80">
                  Signed in
                </p>
                <p className="text-xs font-medium text-emerald-900 dark:text-emerald-100 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 px-3 py-5 space-y-1">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
            Editorial
          </p>
          <Link
            href="/editor"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 font-medium text-sm"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/editor/posts"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 font-medium text-sm transition-colors"
          >
            <FileText className="h-4 w-4" />
            All posts
          </Link>
          <Link
            href="/editor/sources"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 font-medium text-sm transition-colors"
          >
            <Rss className="h-4 w-4" />
            Feed sources
          </Link>
        </nav>

        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
          <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 px-3 py-2.5">
            <div className="flex items-start gap-2">
              <PenLine className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 dark:text-amber-200/90 leading-relaxed">
                Cron adds <strong>drafts</strong> only. You publish manually when ready.
              </p>
            </div>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 font-medium text-sm transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
