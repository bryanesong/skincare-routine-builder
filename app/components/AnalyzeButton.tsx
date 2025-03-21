'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useUser } from '@/app/context/user-provider'
import { createClient } from '@/utils/supabase/client'
import isEqual from 'lodash/isEqual'
import { GeminiAIAnalysis } from '@/app/components/GeminiAIAnalysis'
import { ProductData, RoutineSnapshot, AnalysisData } from '../../types/routine'

interface AnalyzeButtonProps {
    routineId: string;
    ownerId: string;
    existingAnalysis?: AnalysisData;
    current_routine: RoutineSnapshot;
}

export default function AnalyzeButton({
    routineId,
    ownerId,
    existingAnalysis,
    current_routine //current routine has the routine_description, day_products, night_products, skin_type, skin_concerns, climate
}: AnalyzeButtonProps) {
    const { user } = useUser()
    const [isOwner, setIsOwner] = useState(false)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [buttonText, setButtonText] = useState("Analyze Routine")

    const [analysisResult, setAnalysisResult] = useState<AnalysisData | null>(() => {
        // Safely parse the existing analysis if it exists
        console.log('existingAnalysis:', existingAnalysis)
        if (existingAnalysis) {
            try {
                if (typeof existingAnalysis === 'string') {
                    return JSON.parse(existingAnalysis);
                } else if (typeof existingAnalysis === 'object') {
                    return existingAnalysis;
                }
            } catch (e) {
                console.error('Error parsing existing analysis:', e);
            }
        }
        return null;
    })
    const [aiRecommendations, setAiRecommendations] = useState<AnalysisData['analysis'] | null>(null)

    const supabase = createClient()

    // Check if user is owner
    useEffect(() => {
        if (user && user.id === ownerId) {
            setIsOwner(true)
        } else {
            setIsOwner(false)
        }
    }, [user, ownerId])


    // Check if routine has changed since last analysis
    useEffect(() => {
        const checkForChanges = async () => {
            if (!analysisResult?.analysis) {
                setHasChanges(true)
                return
            }

            try {
                // Fetch current routine data
                const { data: routine, error } = await supabase
                    .from('community_builds')
                    .select('*')
                    .eq('shareable_id', routineId)
                    .single()

                if (error) throw error

                // Get the saved snapshot from the analysis
                const previousSnapshot = routine.analysis['routineSnapshot'] as RoutineSnapshot

                // Compare only the relevant data variables directly
                const dayProductsChanged = !isEqual(routine.day_products || [], previousSnapshot.day_products)
                const nightProductsChanged = !isEqual(routine.night_products || [], previousSnapshot.night_products)
                const skinTypeChanged = !isEqual(routine.skin_type || [], previousSnapshot.skin_type)
                const skinConcernsChanged = !isEqual(routine.skin_concerns || [], previousSnapshot.skin_concerns)
                const climateChanged = !isEqual(routine.climate || [], previousSnapshot.climate)

                // Set hasChanges based on whether any of the relevant data has changed
                setHasChanges(
                    dayProductsChanged ||
                    nightProductsChanged ||
                    skinTypeChanged ||
                    skinConcernsChanged ||
                    climateChanged
                )
            } catch (error) {
                console.error('Error checking for routine changes:', error)
                setHasChanges(true) // Default to allowing analysis if check fails
            }
        }

        checkForChanges()
    }, [analysisResult, routineId, supabase])

    // Don't render anything if the user is not the owner
    if (!isOwner) return null

    const handleAnalyzeClick = () => {
        // If there's an existing analysis and no changes, show confirmation popup
        if (analysisResult && !hasChanges) {
            setShowConfirmation(true)
        } else {
            // Otherwise, proceed with analysis
            performAnalysis()
        }
    }

    const performAnalysis = async () => {
        setIsAnalyzing(true)
        setShowConfirmation(false)

        try {
            // Fetch the routine data
            const { data: routine, error } = await supabase
                .from('community_builds')
                .select('day_products, night_products, skin_type, skin_concerns, climate')
                .eq('shareable_id', routineId)
                .single()

            if (error) throw error

            // Create routine snapshot with all relevant variables
            const routineSnapshot: RoutineSnapshot = {
                day_products: routine.day_products || [],
                night_products: routine.night_products || [],
                skin_type: routine.skin_type || [],
                skin_concerns: routine.skin_concerns || [],
                climate: routine.climate || []
            }

            // Create minimal analysis data structure to pass to the AI component
            const analysisData: AnalysisData = {
                timestamp: new Date().toISOString(),
                routineSnapshot: routineSnapshot,
                analysis: {
                    summary: "",
                    routineAnalysis: {
                        day_products: { products: routine.day_products || [], recommendations: [] },
                        night_products: { products: routine.night_products || [], recommendations: [] }
                    },
                    skinProfile: {
                        skinTypeAnalysis: {},
                        concernsAnalysis: {},
                        climateConsiderations: []
                    },
                    recommendations: {
                        general: [],
                        productInteractions: [],
                        missingProducts: [],
                        orderSuggestions: []
                    }
                }
            }

            // Save an empty placeholder to the database (will be updated with AI results)
            const { error: updateError } = await supabase
                .from('community_builds')
                .update({ analysis_notes: analysisData })
                .eq('shareable_id', routineId)

            if (updateError) throw updateError

            setAnalysisResult(analysisData)
            setHasChanges(false)
        } catch (error) {
            console.error('Error preparing for AI analysis:', error)
            // Create error analysis data
            const errorAnalysis: AnalysisData = {
                timestamp: new Date().toISOString(),
                routineSnapshot: {
                    day_products: [],
                    night_products: [],
                    skin_type: [],
                    skin_concerns: [],
                    climate: []
                },
                analysis: {
                    summary: "Failed to prepare routine data. Please try again later.",
                    routineAnalysis: {
                        day_products: { products: [], recommendations: [] },
                        night_products: { products: [], recommendations: [] }
                    },
                    skinProfile: {
                        skinTypeAnalysis: {},
                        concernsAnalysis: {},
                        climateConsiderations: []
                    },
                    recommendations: {
                        general: [],
                        productInteractions: [],
                        missingProducts: [],
                        orderSuggestions: []
                    }
                }
            }
            setAnalysisResult(errorAnalysis)
        } finally {
            setIsAnalyzing(false)
        }
    }

    // Confirmation popup component
    const ConfirmationPopup = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                <h3 className="text-lg font-semibold mb-3">No Changes Detected</h3>
                <p className="mb-4">Your routine hasn't changed since the last analysis. Are you sure you want to re-analyze it?</p>
                <div className="flex justify-end space-x-3">
                    <button
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                        onClick={() => setShowConfirmation(false)}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        onClick={performAnalysis}
                    >
                        Yes, Re-Analyze
                    </button>
                </div>
            </div>
        </div>
    );

    const handleAiAnalysis = (analysis: AnalysisData['analysis']) => {
        // Store whatever structure the AI returns
        setAiRecommendations(analysis)
    }

    return (
        <div className="mb-8 border-b pb-6">
            {current_routine && (
                <GeminiAIAnalysis
                    onAnalysisComplete={handleAiAnalysis}
                    previousRoutine={existingAnalysis?.routineSnapshot || null}
                    current_routine={current_routine}
                    existingAnalysis={existingAnalysis}
                />
            )}

            {/* Confirmation popup */}
            {showConfirmation && <ConfirmationPopup />}
        </div>
    )
}