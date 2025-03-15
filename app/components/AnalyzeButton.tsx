'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useUser } from '@/app/context/user-provider'
import { createClient } from '@/utils/supabase/client'
import isEqual from 'lodash/isEqual'

interface ProductData {
    id: string;
    product_name: string;
    product_type: string;
    // Add other relevant product fields
}

interface RoutineSnapshot {
    dayProducts: ProductData[];
    nightProducts: ProductData[];
    skinType: string[];
    skinConcerns: string[];
    climate: string[];
}

interface AnalysisData {
    timestamp: string;
    summary: string;
    morning: {
        productCount: number;
        recommendations: string[];
    };
    evening: {
        productCount: number;
        recommendations: string[];
    };
    skinTypeAnalysis: {
        [key: string]: string;
    };
    generalRecommendations: string[];
    routineSnapshot: RoutineSnapshot;
}

interface AnalyzeButtonProps {
    routineId: string;
    ownerId: string;
    existingAnalysis?: any;
}

export default function AnalyzeButton({
    routineId,
    ownerId,
    existingAnalysis = null
}: AnalyzeButtonProps) {
    const { user } = useUser()
    const [isOwner, setIsOwner] = useState(false)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [buttonText, setButtonText] = useState("Analyze Routine")
    const [analysisResult, setAnalysisResult] = useState<AnalysisData | null>(() => {
        // Safely parse the existing analysis if it exists
        if (existingAnalysis) {
            console.log('existingAnalysis:', existingAnalysis)
            console.log('existingAnalysis type:', typeof existingAnalysis)
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

    const supabase = createClient()

    // Check if user is owner
    useEffect(() => {
        if (user && user.id === ownerId) {
            setIsOwner(true)
        } else {
            setIsOwner(false)
        }
    }, [user, ownerId])

    // Set button text based on existing analysis
    useEffect(() => {
        if (analysisResult) {
            setButtonText("Re-Analyze Routine")
        } else {
            setButtonText("Analyze Routine")
        }
    }, [analysisResult])

    // Check if routine has changed since last analysis
    useEffect(() => {
        const checkForChanges = async () => {
            if (!analysisResult?.routineSnapshot) {
                setHasChanges(true)
                return
            }

            try {
                // Fetch current routine data
                const { data: routine, error } = await supabase
                    .from('community_builds')
                    .select('day_products, night_products, skin_type, skin_concerns, climate')
                    .eq('shareable_id', routineId)
                    .single()

                if (error) throw error

                // Get the saved snapshot from the analysis
                const previousSnapshot = analysisResult.routineSnapshot

                // Compare only the relevant data variables directly
                const dayProductsChanged = !isEqual(routine.day_products || [], previousSnapshot.dayProducts)
                const nightProductsChanged = !isEqual(routine.night_products || [], previousSnapshot.nightProducts)
                const skinTypeChanged = !isEqual(routine.skin_type || [], previousSnapshot.skinType)
                const skinConcernsChanged = !isEqual(routine.skin_concerns || [], previousSnapshot.skinConcerns)
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

            const dayProductCount = routine.day_products?.length || 0
            const nightProductCount = routine.night_products?.length || 0
            const skinTypes = routine.skin_type || []

            // Create routine snapshot with all relevant variables
            const routineSnapshot: RoutineSnapshot = {
                dayProducts: routine.day_products || [],
                nightProducts: routine.night_products || [],
                skinType: routine.skin_type || [],
                skinConcerns: routine.skin_concerns || [],
                climate: routine.climate || []
            }

            // Create structured analysis data in JSONB format
            const analysisData: AnalysisData = {
                timestamp: new Date().toISOString(),
                summary: generateSummary(dayProductCount, nightProductCount),
                morning: {
                    productCount: dayProductCount,
                    recommendations: generateMorningRecommendations(dayProductCount, routine.day_products || [])
                },
                evening: {
                    productCount: nightProductCount,
                    recommendations: generateEveningRecommendations(nightProductCount, routine.night_products || [])
                },
                skinTypeAnalysis: generateSkinTypeAnalysis(skinTypes),
                generalRecommendations: [
                    "Consider if your routine addresses your specific skin concerns",
                    "Check if the product order is optimal for absorption",
                    "Make sure products with conflicting ingredients aren't used together"
                ],
                routineSnapshot: routineSnapshot
            }

            // Save the analysis to the database in JSONB format
            const { error: updateError } = await supabase
                .from('community_builds')
                .update({ analysis_notes: analysisData })
                .eq('shareable_id', routineId)

            if (updateError) throw updateError

            setAnalysisResult(analysisData)
            setHasChanges(false) // Reset changes flag after successful analysis
        } catch (error) {
            console.error('Error analyzing routine:', error)
            // Create error analysis data
            const errorAnalysis: AnalysisData = {
                timestamp: new Date().toISOString(),
                summary: "Failed to analyze routine. Please try again later.",
                morning: { productCount: 0, recommendations: [] },
                evening: { productCount: 0, recommendations: [] },
                skinTypeAnalysis: {},
                generalRecommendations: [],
                routineSnapshot: {
                    dayProducts: [],
                    nightProducts: [],
                    skinType: [],
                    skinConcerns: [],
                    climate: []
                }
            }
            setAnalysisResult(errorAnalysis)
        } finally {
            setIsAnalyzing(false)
        }
    }

    // Helper functions to generate analysis parts
    function generateSummary(dayCount: number, nightCount: number): string {
        if (dayCount === 0 && nightCount === 0) {
            return "Your routine doesn't have any products yet. Consider adding some products to get started!";
        }
        return `Your routine has ${dayCount} morning products and ${nightCount} evening products.`;
    }

    function generateMorningRecommendations(count: number, products: any[]): string[] {
        if (count === 0) return ["Consider adding a morning cleanser", "Sunscreen is essential for daytime protection"];

        const recommendations: string[] = [];

        // Check for cleanser
        if (!products.some(p => p.product_type?.toLowerCase().includes('cleanser'))) {
            recommendations.push("Consider adding a gentle morning cleanser");
        }

        // Check for sunscreen
        if (!products.some(p => p.product_type?.toLowerCase().includes('sunscreen') ||
            p.product_name?.toLowerCase().includes('spf'))) {
            recommendations.push("Adding a sunscreen is crucial for daytime protection");
        }

        return recommendations.length > 0 ? recommendations : ["Your morning routine looks good!"];
    }

    function generateEveningRecommendations(count: number, products: any[]): string[] {
        if (count === 0) return ["Consider adding an evening cleanser", "Night is a good time for treatment products"];

        const recommendations: string[] = [];

        // Check for cleanser
        if (!products.some(p => p.product_type?.toLowerCase().includes('cleanser'))) {
            recommendations.push("Consider adding an evening cleanser to remove makeup and daily buildup");
        }

        // Check for moisturizer
        if (!products.some(p => p.product_type?.toLowerCase().includes('moisturizer'))) {
            recommendations.push("Adding a night moisturizer can help repair your skin while you sleep");
        }

        return recommendations.length > 0 ? recommendations : ["Your evening routine looks good!"];
    }

    function generateSkinTypeAnalysis(skinTypes: string[]): { [key: string]: string } {
        const analysis: { [key: string]: string } = {};

        if (skinTypes.length === 0) {
            analysis["unknown"] = "No skin types specified. Consider updating your skin profile for better analysis.";
            return analysis;
        }

        skinTypes.forEach(type => {
            switch (type.toLowerCase()) {
                case "dry":
                    analysis["dry"] = "Look for hydrating ingredients like hyaluronic acid and ceramides.";
                    break;
                case "oily":
                    analysis["oily"] = "Consider non-comedogenic products and gentle exfoliation.";
                    break;
                case "combination":
                    analysis["combination"] = "You may need different products for different areas of your face.";
                    break;
                case "sensitive":
                    analysis["sensitive"] = "Avoid fragrances and harsh ingredients, opt for gentle formulations.";
                    break;
                default:
                    analysis[type.toLowerCase()] = `Your routine appears to address ${type} skin.`;
            }
        });

        return analysis;
    }

    // Render the analysis in a readable format
    const renderAnalysis = () => {
        console.log('analysisResult:', analysisResult)
        if (!analysisResult) return null;
        // Validate analysis data before rendering
        if (!analysisResult.summary ||
            !analysisResult.morning ||
            !analysisResult.evening ||
            !analysisResult.skinTypeAnalysis ||
            !analysisResult.generalRecommendations) {
            console.error('Analysis data is incomplete:', analysisResult);
            return (
                <div className="mt-4 p-4 bg-red-50 rounded-lg">
                    <p className="text-red-600">Analysis data is incomplete. Please try analyzing again.</p>
                </div>
            );
        }

        return (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">Analysis Results</h3>
                <p className="text-gray-700 mb-3">{analysisResult.summary}</p>

                {(analysisResult.morning.productCount > 0 || analysisResult.morning.recommendations.length > 0) && (
                    <div className="mb-3">
                        <h4 className="font-medium text-sm">Morning Routine</h4>
                        <p className="text-gray-700">Products: {analysisResult.morning.productCount}</p>
                        {analysisResult.morning.recommendations.length > 0 && (
                            <ul className="list-disc pl-5 text-sm text-gray-600">
                                {analysisResult.morning.recommendations.map((rec, idx) => (
                                    <li key={`morning-${idx}`}>{rec}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                {(analysisResult.evening.productCount > 0 || analysisResult.evening.recommendations.length > 0) && (
                    <div className="mb-3">
                        <h4 className="font-medium text-sm">Evening Routine</h4>
                        <p className="text-gray-700">Products: {analysisResult.evening.productCount}</p>
                        {analysisResult.evening.recommendations.length > 0 && (
                            <ul className="list-disc pl-5 text-sm text-gray-600">
                                {analysisResult.evening.recommendations.map((rec, idx) => (
                                    <li key={`evening-${idx}`}>{rec}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                {Object.keys(analysisResult.skinTypeAnalysis).length > 0 && (
                    <div className="mb-3">
                        <h4 className="font-medium text-sm">Skin Type Analysis</h4>
                        {Object.entries(analysisResult.skinTypeAnalysis).map(([type, analysis], idx) => (
                            <p key={`skin-${idx}`} className="text-sm text-gray-600">
                                <span className="font-medium">{type.charAt(0).toUpperCase() + type.slice(1)}:</span> {analysis}
                            </p>
                        ))}
                    </div>
                )}

                {analysisResult.generalRecommendations.length > 0 && (
                    <div>
                        <h4 className="font-medium text-sm">General Recommendations</h4>
                        <ul className="list-disc pl-5 text-sm text-gray-600">
                            {analysisResult.generalRecommendations.map((rec, idx) => (
                                <li key={`general-${idx}`}>{rec}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    };

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

    return (
        <div className="mb-8 border-b pb-6">
            <h2 className="text-lg font-semibold mb-4">Notes for Routine</h2>
            <button
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                onClick={handleAnalyzeClick}
                disabled={isAnalyzing}
            >
                {isAnalyzing ? 'Analyzing...' : buttonText}
            </button>

            {analysisResult && renderAnalysis()}

            {/* Confirmation popup */}
            {showConfirmation && <ConfirmationPopup />}
        </div>
    )
}