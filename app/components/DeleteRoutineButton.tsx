'use client'

import { useState } from 'react'
import { Button } from "@/app/components/ui/button"
import { Trash2 } from "lucide-react"
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/components/ui/tooltip"

interface DeleteRoutineButtonProps {
    shareableId: string
}

export default function DeleteRoutineButton({ shareableId }: DeleteRoutineButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this routine? This action cannot be undone.")) {
            return
        }

        setIsDeleting(true)
        setError(null)

        try {
            const supabase = createClient()

            // Delete the routine from the database
            const { error: deleteError } = await supabase
                .from('community_builds')
                .delete()
                .eq('shareable_id', shareableId)

            if (deleteError) {
                throw deleteError
            }

            // Redirect to the builds page after successful deletion
            router.push('/builds')
            router.refresh()
        } catch (err) {
            console.error('Error deleting routine:', err)
            setError('Failed to delete routine. Please try again.')
            setIsDeleting(false)
        }
    }

    return (
        <div className="relative">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete routine</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Delete this routine</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            {error && (
                <div className="absolute right-0 top-full mt-2 text-red-500 text-sm whitespace-nowrap">
                    {error}
                </div>
            )}
        </div>
    )
} 