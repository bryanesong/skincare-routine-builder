'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/app/components/ui/button"
import { Trash2 } from "lucide-react"
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useUser } from '@/app/context/user-provider'

interface DeleteButtonProps {
    shareableId: string
    ownerId: string
}

export default function DeleteButton({ shareableId, ownerId }: DeleteButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()
    const { user } = useUser()

    const [isOwner, setIsOwner] = useState(false)

    // Check if user is owner
    useEffect(() => {
        if (user && user.id === ownerId) {
            setIsOwner(true)
        } else {
            setIsOwner(false)
        }
    }, [user, ownerId])

    // Log when component mounts to verify it's rendering
    console.log('DeleteButton rendering for:', shareableId)

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this routine? This action cannot be undone.")) {
            return
        }

        setIsDeleting(true)

        try {
            const supabase = createClient()

            console.log('Deleting routine with shareable_id:', shareableId)

            const { error: deleteError } = await supabase
                .from('community_builds')
                .delete()
                .eq('shareable_id', shareableId)

            if (deleteError) {
                console.error('Error deleting:', deleteError)
                throw deleteError
            }

            console.log('Successfully deleted routine')

            // Redirect to the builds page after successful deletion
            router.push('/builds')
            router.refresh()
        } catch (err) {
            console.error('Failed to delete routine:', err)
            alert('Failed to delete routine. Please try again.')
            setIsDeleting(false)
        }
    }

    // Don't render anything if the user is not the owner
    if (!isOwner) return null

    return (
        <Button
            variant="outline"
            size="icon"
            className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
            onClick={handleDelete}
            disabled={isDeleting}
            title="Delete this routine"
        >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete routine</span>
        </Button>
    )
} 