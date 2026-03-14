import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Use getUser() for security - this verifies the session with Supabase Auth
  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // 1. If NOT logged in and trying to access any dashboard route
  if (!user && path.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  // 2. If LOGGED IN
  if (user) {
    // Check for Master Admin Email
    const isMasterAdmin = user.email?.toLowerCase() === 'pixelnodeofficial@gmail.com'

    // 3. Redirect from Root or Signin to the correct Dashboard
    if (path === '/' || path === '/signin') {
      const target = isMasterAdmin ? '/dashboard/admin' : '/dashboard/employee'
      return NextResponse.redirect(new URL(target, request.url))
    }

    // 4. Handle generic /dashboard route
    if (path === '/dashboard') {
      const target = isMasterAdmin ? '/dashboard/admin' : '/dashboard/employee'
      return NextResponse.redirect(new URL(target, request.url))
    }

    // 5. PROTECT ADMIN ROUTE: If non-admin tries to access /dashboard/admin
    if (path.startsWith('/dashboard/admin') && !isMasterAdmin) {
      // Check database as a secondary backup for other admins
      const { data: profile } = await supabase
        .from('employees')
        .select('is_admin')
        .eq('user_id', user.id)
        .single()
      
      if (!profile?.is_admin) {
        return NextResponse.redirect(new URL('/dashboard/employee', request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}