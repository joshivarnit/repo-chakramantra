import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isEditorAllowed } from '@/lib/editor-allowlist'

const EDITOR_PREFIX = '/editor'
const EDITOR_LOGIN = '/editor/login'

export async function updateSession(request: NextRequest) {
  // Legacy admin URLs → editorial workspace (not linked on the public site)
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const url = request.nextUrl.clone()
    url.pathname = request.nextUrl.pathname.replace(/^\/admin/, EDITOR_PREFIX)
    return NextResponse.redirect(url)
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isEditorRoute = request.nextUrl.pathname.startsWith(EDITOR_PREFIX)
  const isEditorLogin = request.nextUrl.pathname === EDITOR_LOGIN

  if (isEditorRoute && !isEditorLogin) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = EDITOR_LOGIN
      url.searchParams.set('next', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }

    const allowed = await isEditorAllowed(user.email)
    if (!allowed) {
      await supabase.auth.signOut()
      const url = request.nextUrl.clone()
      url.pathname = EDITOR_LOGIN
      url.searchParams.set(
        'error',
        'Your account is not authorized for editorial access. Ask the site owner to add your email.'
      )
      return NextResponse.redirect(url)
    }
  }

  if (user && isEditorLogin) {
    const allowed = await isEditorAllowed(user.email)
    if (allowed) {
      const url = request.nextUrl.clone()
      url.pathname = EDITOR_PREFIX
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
