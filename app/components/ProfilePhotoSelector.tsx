'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'
import { redirect } from 'next/navigation'

const placeholderImages = [
    '/default_profile_photos/pfp_1.png',
    '/default_profile_photos/pfp_2.png',
    '/default_profile_photos/pfp_3.png',
    '/default_profile_photos/pfp_4.png',
    '/default_profile_photos/pfp_5.png',
    '/default_profile_photos/pfp_6.png',
    '/default_profile_photos/pfp_7.png',
    '/default_profile_photos/pfp_8.png',
]

const ProfilePhotoSelector = ({ userId, userAuthId }: { userId: string, userAuthId: string }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedImage, setSelectedImage] = useState(placeholderImages[0])
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClient()

    // Fetch the user's current profile photo on component mount
    useEffect(() => {
        const fetchProfilePhoto = async () => {
            try {
                if (!userAuthId) {
                    console.error('User auth ID not provided')
                    return
                }

                const { data, error } = await supabase
                    .from('user_data_personal')
                    .select('avatar_url')
                    .eq('id', userAuthId)
                    .single()

                if (error) {
                    console.error('Error fetching profile photo:', error)
                    return
                }

                if (data?.avatar_url) {
                    setSelectedImage(data.avatar_url)
                } else {
                    //if no avatar url, set default profile photo
                    setSelectedImage(placeholderImages[0])
                }
            } catch (error) {
                console.error('Error fetching profile photo:', error)
            }
        }

        if (userId) {
            fetchProfilePhoto()
        }
    }, [userId, userAuthId, supabase])

    const updateProfilePhoto = async (photoUrl: string) => {
        setIsLoading(true)
        try {
            console.log('Updating profile photo...', photoUrl)

            if (!userAuthId) {
                console.error('User auth ID not provided')
                return
            }

            const { error } = await supabase
                .from('user_data_personal')
                .update({ avatar_url: photoUrl })
                .eq('id', userAuthId)

            if (error) {
                console.error('Error updating profile photo:', error)
                return
            } else {
                console.log('userAuthId', userAuthId)
                console.log('Profile photo updated successfully:', photoUrl)
            }

            setSelectedImage(photoUrl)
        } catch (error) {
            console.error('Error updating profile photo:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSelectPhoto = async (img: string) => {
        setIsOpen(false)
        if (img !== selectedImage) {
            updateProfilePhoto(img)
        }
    }

    return (
        <div className="relative">
            {/* Profile Photo with Edit Overlay */}
            <div
                className="relative w-20 h-20 rounded-full overflow-hidden cursor-pointer group border-2 border-gray-300"
                onClick={() => setIsOpen(true)}
            >
                <Image
                    src={selectedImage}
                    alt="Profile photo"
                    width={500}
                    height={500}
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                </div>
                {isLoading && (
                    <div className="absolute inset-0 bg-black bg-opacity-25 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                    </div>
                )}
            </div>

            {/* Photo Selection Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">Select Profile Photo</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {placeholderImages.map((img, index) => (
                                <div
                                    key={index}
                                    className={`relative w-16 h-16 rounded-full overflow-hidden cursor-pointer ${selectedImage === img ? 'ring-2 ring-blue-500' : ''}`}
                                    onClick={() => handleSelectPhoto(img)}
                                >
                                    <Image
                                        src={img}
                                        alt={`Avatar option ${index + 1}`}
                                        width={64}
                                        height={64}
                                        className="object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProfilePhotoSelector 