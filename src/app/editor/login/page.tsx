import { signIn, signOut } from '@/app/editor/actions';
import { createClient } from '@/lib/supabase/server';
import { isEditorAllowed } from '@/lib/editor-allowlist';
import { LogIn, PenLine, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default async function EditorLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const signedIn = Boolean(user);
  const authorized = signedIn ? await isEditorAllowed(user!.email) : false;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden bg-zinc-950">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        <div className="text-center mb-2">
          <div className="mx-auto h-14 w-14 rounded-2xl glass flex items-center justify-center mb-5">
            <Sparkles className="h-7 w-7 text-blue-400" />
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-gradient">
            Editorial workspace
          </h1>
          <p className="text-sm text-zinc-400 mt-2">
            Private area for reviewing cron drafts and publishing manually. Not linked from the public site.
          </p>
        </div>

        {signedIn && authorized && (
          <div className="glass-card rounded-2xl p-6 text-center space-y-4">
            <p className="text-sm text-emerald-400">
              Signed in as <strong className="text-white">{user!.email}</strong>
            </p>
            <Link
              href="/editor"
              className="inline-flex w-full h-11 items-center justify-center rounded-lg bg-white text-black font-semibold hover:bg-zinc-200 transition-colors"
            >
              Go to dashboard
            </Link>
          </div>
        )}

        {signedIn && !authorized && (
          <div className="glass-card rounded-2xl p-6 text-center space-y-4">
            <p className="text-sm text-amber-300">
              Signed in as <strong className="text-white">{user!.email}</strong>, but this account is not on the editor allowlist.
            </p>
            <form action={signOut}>
              <button
                type="submit"
                className="w-full h-10 rounded-lg border border-white/20 text-sm font-medium text-zinc-300 hover:bg-white/10 transition-colors"
              >
                Sign out and try another account
              </button>
            </form>
          </div>
        )}

        {(!signedIn || !authorized) && (
          <div className="glass-card rounded-2xl p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-9 w-9 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <LogIn className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold">Sign in</h2>
                <p className="text-xs text-zinc-500">Only allowlisted emails can access</p>
              </div>
            </div>

            <form action={signIn} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-300" htmlFor="signin-email">
                  Email
                </label>
                <input
                  id="signin-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  defaultValue={user?.email ?? ''}
                  className="w-full h-11 px-4 bg-black/20 border border-white/10 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-300" htmlFor="signin-password">
                  Password
                </label>
                <input
                  id="signin-password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full h-11 px-4 bg-black/20 border border-white/10 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full h-11 bg-white text-black font-semibold rounded-lg flex items-center justify-center gap-2 transition-all hover:bg-zinc-200 mt-2 active:scale-[0.98]"
              >
                <LogIn className="h-4 w-4" />
                Sign in
              </button>
            </form>

            {error && (
              <div className="p-3 mt-4 text-sm text-center text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg">
                {error}
              </div>
            )}
          </div>
        )}

        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 flex gap-3">
          <PenLine className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
          <p className="text-xs text-zinc-500 leading-relaxed">
            Daily cron jobs save articles as <strong className="text-zinc-300">drafts</strong>. Edit here, then publish when ready. To add another editor later, insert their email into the{' '}
            <code className="text-zinc-400">editor_allowlist</code> table in Supabase.
          </p>
        </div>

        <p className="text-center">
          <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            ← Back to Chakramantra
          </Link>
        </p>
      </div>
    </div>
  );
}
