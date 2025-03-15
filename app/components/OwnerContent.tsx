'use client'

import { useUser } from '@/app/context/user-provider'
import AnalyzeButton from './AnalyzeButton'
import { useEffect, useState } from 'react'

interface OwnerContentProps {
    routineId: string
    ownerId: string
    analyzedResults?: any
}

export default function OwnerContent({ routineId, ownerId, analyzedResults }: OwnerContentProps) {
    const { user } = useUser()

    const [isOwner, setIsOwner] = useState(false)

    // Debug the incoming analyzed results
    console.log('OWNER CONTENT received analyzedResults123:', analyzedResults)

    useEffect(() => {
        // Check if the current user is the owner of the routine
        if (user && user.id === ownerId) {
            setIsOwner(true)
        } else {
            setIsOwner(false)
        }
    }, [user, ownerId])

    // Don't render anything if the user is not the owner
    if (!isOwner) return null

    return (
        <div className="mb-8 border-b pb-6">
            <h2 className="text-lg font-semibold mb-4">Notes for Routine</h2>
            <AnalyzeButton
                routineId={routineId}
                ownerId={ownerId}
                existingAnalysis={analyzedResults}
            />
        </div>
    )
} 