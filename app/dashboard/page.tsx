"use client"

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import Link from 'next/link'
import { Button } from '../components/ui/button'
import ProfilePhotoSelector from '@/app/components/ProfilePhotoSelector'
import DashboardContent from './DashboardContent'

export default function Dashboard() {
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState(null)
    const router = useRouter()
    const supabase = createClientComponentClient()

    useEffect(() => {
        async function getUser() {
            try {
                setLoading(true)

                // Check if we have a session
                const { data: { session }, error } = await supabase.auth.getSession()

                if (error) {
                    console.error('Error checking auth session:', error)
                    router.push('/login')
                    return
                }

                if (!session) {
                    console.log('No active session found, redirecting to login')
                    router.push('/login')
                    return
                }

                // We have a valid session
                setUser(session.user)
                console.log('User authenticated:', session.user.email)

            } catch (error) {
                console.error('Unexpected error checking auth:', error)
                router.push('/login')
            } finally {
                setLoading(false)
            }
        }

        getUser()
    }, [router, supabase])

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <p>Loading...</p>
            </div>
        )
    }

    return (
        <DashboardContent userData={user} />
    )
} 