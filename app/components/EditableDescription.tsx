'use client'

import { useState } from 'react'
import { Button } from "@/app/components/ui/button"
import { PencilIcon, CheckIcon, XIcon } from "lucide-react"
import { createClient } from '@/utils/supabase/client'
import { Textarea } from "@/app/components/ui/textarea"

interface EditableDescriptionProps {
    initialDescription: string
    isOwner: boolean
    shareableId: string
}

export default function EditableDescription({ initialDescription, isOwner, shareableId }: EditableDescriptionProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [description, setDescription] = useState(initialDescription)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSave = async () => {
        setIsSaving(true)
        setError(null)

        try {
            const supabase = createClient()
            const { error: updateError } = await supabase
                .from('community_builds')
                .update({
                    routine_description: description,
                    updated_at: new Date().toISOString()
                })
                .eq('shareable_id', shareableId)

            if (updateError) {
                throw updateError
            }

            setIsEditing(false)
            // Force a page refresh to show the updated description
            window.location.reload()
        } catch (err) {
            console.error('Error updating description:', err)
            setError('Failed to save changes. Please try again.')
            setDescription(initialDescription) // Reset to original on error
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancel = () => {
        setDescription(initialDescription)
        setIsEditing(false)
        setError(null)
    }

    if (!isOwner) {
        return (
            <div className="mb-8">
                <h2 className="text-lg font-semibold mb-2">Routine Description</h2>
                <p className="text-gray-600">{description || 'No description provided.'}</p>
            </div>
        )
    }

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">Routine Description</h2>
                {isOwner && !isEditing && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="hover:bg-blue-50 text-blue-600 hover:text-blue-700 border-blue-200"
                    >
                        <PencilIcon className="h-4 w-4 mr-2" />
                        Edit Description
                    </Button>
                )}
            </div>

            {isEditing ? (
                <div className="space-y-2">
                    <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="min-h-[100px] w-full"
                        placeholder="Describe your skincare routine..."
                    />
                    {error && (
                        <p className="text-sm text-red-600">{error}</p>
                    )}
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancel}
                            disabled={isSaving}
                        >
                            <XIcon className="h-4 w-4 mr-1" />
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={isSaving || !description.trim()}
                        >
                            {isSaving ? (
                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                            ) : (
                                <CheckIcon className="h-4 w-4 mr-1" />
                            )}
                            {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="relative group">
                    <p className="text-gray-600">{description || 'No description provided.'}</p>
                    {isOwner && (
                        <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsEditing(true)}
                                className="hover:bg-blue-50 text-blue-600"
                            >
                                <PencilIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
} 