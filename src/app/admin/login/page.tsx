import { signIn, signUp } from '@/app/admin/actions';
import { Sparkles, LogIn, UserPlus } from 'lucide-react';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; signup_error?: string; success?: string }>;
}) {
  const { error, signup_error, success } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        <div className="text-center mb-2">
          <div className="mx-auto h-14 w-14 rounded-2xl glass flex items-center justify-center mb-5">
            <Sparkles className="h-7 w-7 text-blue-400" />
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-gradient">
            Chakramantra Admin
          </h1>
          <p className="text-sm text-zinc-400 mt-2">
            Review and publish articles from your editorial dashboard
          </p>
        </div>

        {/* Sign In */}
        <div className="glass-card rounded-2xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-9 w-9 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <LogIn className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold">Sign in</h2>
              <p className="text-xs text-zinc-500">Access your existing account</p>
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

        <div className="flex items-center gap-4 px-2">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Sign Up */}
        <div className="glass-card rounded-2xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-9 w-9 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <UserPlus className="h-4 w-4 text-purple-400" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold">Create account</h2>
              <p className="text-xs text-zinc-500">Register a new admin user</p>
            </div>
          </div>

          <form action={signUp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-300" htmlFor="signup-email">
                Email
              </label>
              <input
                id="signup-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full h-11 px-4 bg-black/20 border border-white/10 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-300" htmlFor="signup-password">
                Password
              </label>
              <input
                id="signup-password"
                name="password"
                type="password"
                placeholder="At least 8 characters"
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full h-11 px-4 bg-black/20 border border-white/10 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full h-11 border border-white/20 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all hover:bg-white/10 mt-2 active:scale-[0.98]"
            >
              <UserPlus className="h-4 w-4" />
              Sign up
            </button>
          </form>

          {signup_error && (
            <div className="p-3 mt-4 text-sm text-center text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg">
              {signup_error}
            </div>
          )}
          {success && (
            <div className="p-3 mt-4 text-sm text-center text-emerald-400 bg-emerald-950/30 border border-emerald-900/50 rounded-lg">
              {success}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
