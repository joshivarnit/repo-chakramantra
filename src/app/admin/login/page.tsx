import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sparkles, KeyRound } from 'lucide-react'

async function login(formData: FormData) {
  'use server'

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  const supabase = await createClient()

  // During MVP / initial setup, we might want to auto-create the user if they don't exist,
  // but standard practice is they sign up first or you invite them.
  // We'll use sign in with password.
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // If sign in fails, try signing up for the first time
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (signUpError) {
        redirect(`/admin/login?message=${encodeURIComponent(signUpError.message)}`)
    }
  }

  // If we just signed up, but email confirmation is required, Supabase won't log us in immediately.
  // We need to check if we actually have a session before redirecting to /admin, otherwise show a message.
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
      redirect('/admin/login?message=Check your email to confirm your account.')
  }

  redirect('/admin')
}

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ message: string }>
}) {
  const { message } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-sm glass-card rounded-2xl p-8 relative z-10">
        <div className="flex flex-col items-center mb-8">
            <div className="h-14 w-14 rounded-2xl glass flex items-center justify-center mb-5 rotate-3 hover:rotate-6 transition-transform">
                <Sparkles className="h-7 w-7 text-blue-400" />
            </div>
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="font-heading text-2xl font-bold tracking-tight text-gradient">Chakramantra Admin</h1>
              <p className="text-sm text-zinc-400">Sign in to access the dashboard</p>
            </div>
        </div>

        <form className="space-y-5" action={login}>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="w-full h-11 px-4 bg-black/20 border border-white/10 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="w-full h-11 px-4 bg-black/20 border border-white/10 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
            />
          </div>
          <button type="submit" className="w-full h-11 bg-white text-black font-semibold rounded-lg flex items-center justify-center gap-2 transition-all hover:bg-zinc-200 mt-6 active:scale-[0.98] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            <KeyRound className="h-4 w-4" />
            Sign In / Sign Up
          </button>
          
          {message && (
            <div className="p-3 mt-4 text-sm text-center text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg backdrop-blur-sm">
                {message}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
