import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
    // Get the auth code from the URL
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (code) {
        // Create a Supabase client
        const cookieStore = cookies()
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

        try {
            // Exchange the code for a session
            await supabase.auth.exchangeCodeForSession(code)

            // Redirect to dashboard - use absolute URL to avoid domain issues
            const redirectUrl = process.env.NODE_ENV === 'production'
                ? 'https://buildmyskincare.com/dashboard'
                : 'http://localhost:3000/dashboard'

            return NextResponse.redirect(redirectUrl)
        } catch (error) {
            console.error('Error exchanging code for session:', error)
            return NextResponse.redirect('/login?error=auth_exchange_failed')
        }
    }

    return NextResponse.redirect('/login?error=no_code_provided')
} 