'use client'

import { useState, useEffect } from 'react'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import Link from 'next/link'
import { Button } from '../components/ui/button'
import ProfilePhotoSelector from '@/app/components/ProfilePhotoSelector'
import { PencilIcon, XIcon } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function DashboardContent({ userData }) {
    const [isLoading, setIsLoading] = useState(true)
    const [isEditingName, setIsEditingName] = useState(false)
    const [displayName, setDisplayName] = useState(userData.display_name)
    const [newDisplayName, setNewDisplayName] = useState(userData.display_name)
    const supabase = createClient()
    
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 650) // 0.65 seconds loading time
        
        return () => clearTimeout(timer)
    }, [])

    const handleEditName = () => {
        setIsEditingName(true)
    }

    const handleCloseEdit = () => {
        setIsEditingName(false)
        setNewDisplayName(displayName) // Reset to current name
    }

    const handleSaveName = async () => {
        // Here you would add API call to update the name in your database
        // For example: await updateUserDisplayName(userData.id, newDisplayName)
        
        const { error } = await supabase
                .from('user_data_personal')
                .update({ display_name: newDisplayName })
                .eq('id', userData.id)
        if (error) {
            console.error('Error updating display name:', error)
        } else {
            setDisplayName(newDisplayName)
            setIsEditingName(false)
        }
    }

    // Prepare the dashboard content that will be pre-loaded
    const dashboardContent = (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="mx-auto py-6"></div>
            <main className="flex-grow container mx-auto px-4 py-8 border-2 border-red-500">
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <ProfilePhotoSelector userId={userData.id} userAuthId={userData.id} />
                        <div className="flex items-center">
                            <h1 className="text-3xl font-bold">{displayName}</h1>
                            <button 
                                onClick={handleEditName}
                                className="ml-2 p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                                aria-label="Edit display name"
                            >
                                <PencilIcon size={16} />
                            </button>
                        </div>
                    </div>
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

            {/* Edit Name Modal */}
            {isEditingName && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Edit Display Name</h2>
                            <button 
                                onClick={handleCloseEdit}
                                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                aria-label="Close"
                            >
                                <XIcon size={20} />
                            </button>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                                Display Name (max 16 characters)
                            </label>
                            <input
                                type="text"
                                id="displayName"
                                value={newDisplayName}
                                onChange={(e) => setNewDisplayName(e.target.value.slice(0, 16))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                maxLength={16}
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                {newDisplayName.length}/16 characters
                            </p>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={handleCloseEdit}>
                                Cancel
                            </Button>
                            <Button onClick={handleSaveName}>
                                Save
                            </Button>
                        </div>
                    </div>
                </div>
            )}
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