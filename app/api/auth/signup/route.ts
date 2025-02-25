import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'


// Handle GET requests
export const GET = async (request: NextRequest) => {
  return NextResponse.json(
    { message: 'Method not allowed' },
    { status: 405 }
  )
}

// Handle POST requests
export const POST = async (request: NextRequest) => {
  if (request.method !== 'POST') {
    return NextResponse.json(
      { message: 'Method not allowed' },
      { status: 405 }
    )
  }

  try {
    const { email, password } = await request.json()
    
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: error.message || 'An error occurred' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { user: data.user },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

