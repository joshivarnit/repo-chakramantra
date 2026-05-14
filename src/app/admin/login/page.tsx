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
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm">
        <div className="flex flex-col items-center mb-8">
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="font-heading text-2xl font-bold tracking-tight">Chakramantra Admin</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Sign in to access the dashboard</p>
            </div>
        </div>

        <form className="space-y-4" action={login}>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="w-full h-10 px-3 bg-transparent border border-zinc-300 dark:border-zinc-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="w-full h-10 px-3 bg-transparent border border-zinc-300 dark:border-zinc-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button type="submit" className="w-full h-10 bg-foreground text-background font-medium rounded-md flex items-center justify-center gap-2 transition-colors hover:bg-foreground/90 mt-2">
            <KeyRound className="h-4 w-4" />
            Sign In / Sign Up
          </button>
          
          {message && (
            <div className="p-3 mt-4 text-sm text-center text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20 rounded-md">
                {message}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
