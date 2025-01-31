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

    const { data, error } = { data: null, error: null }

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { user: data.user },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

