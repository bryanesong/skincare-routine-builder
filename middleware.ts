import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })

    // Check for session, refresh if needed
    const { data: { session } } = await supabase.auth.getSession()

    // If accessing protected routes without session, redirect to login
    const isProtectedRoute = req.nextUrl.pathname.startsWith('/dashboard')
    if (isProtectedRoute && !session) {
        const loginUrl = new URL('/login', req.url)
        return NextResponse.redirect(loginUrl)
    }

    // If accessing login/signup with active session, redirect to dashboard
    const isAuthRoute = req.nextUrl.pathname.startsWith('/login') ||
        req.nextUrl.pathname.startsWith('/signup')
    if (isAuthRoute && session) {
        const dashboardUrl = new URL('/dashboard', req.url)
        return NextResponse.redirect(dashboardUrl)
    }

    return res
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
} 