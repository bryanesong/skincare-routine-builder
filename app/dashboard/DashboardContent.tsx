'use client'

import { useState, useEffect } from 'react'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import Link from 'next/link'
import { Button } from '../components/ui/button'
import ProfilePhotoSelector from '@/app/components/ProfilePhotoSelector'

export default function DashboardContent({ user }) {
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 650) // 0.65 seconds loading time
        
        return () => clearTimeout(timer)
    }, [])

    // Prepare the dashboard content that will be pre-loaded
    const dashboardContent = (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="mx-auto py-6"></div>
            <main className="flex-grow container mx-auto px-4 py-8 border-2 border-red-500">
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold">Welcome to Your Dashboard {user.email}</h1>
                    <h2>
                        <ProfilePhotoSelector userId={user.id} userAuthId={user.id} />
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold mb-4">Your Skincare Routines</h2>
                            <Button asChild>
                                <Link href="/build">Create New Routine</Link>
                            </Button>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold mb-4">Saved Products</h2>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )

    return (
        <>
            {/* Hidden dashboard content that pre-loads while loading screen is shown */}
            <div className={isLoading ? "hidden" : ""}>
                {dashboardContent}
            </div>

            {/* Loading screen */}
            {isLoading && (
                <div className="min-h-screen flex flex-col">
                <Header />
                <div className="mx-auto py-6"></div>
                <div className="min-h-screen flex flex-col items-center justify-center">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-lg font-medium">Loading your dashboard...</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
} 