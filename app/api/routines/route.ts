import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { skinType, concerns, preferences, createdAt } = await request.json()

    await sql`
      INSERT INTO routines (
        user_email,
        skin_type,
        concerns,
        preferences,
        created_at
      ) VALUES (
        ${session.user.email},
        ${skinType},
        ${JSON.stringify(concerns)},
        ${JSON.stringify(preferences)},
        ${createdAt}
      )
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Database Error:', error)
    return NextResponse.json({ error: 'Database Error' }, { status: 500 })
  }
} 