'use client'

import { useState } from 'react'
import { Button } from "@/app/components/ui/button"
import { Loader2 } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/app/components/ui/alert-dialog"
import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/client'
import { ProductData, RoutineSnapshot, AnalysisData } from "../../types/routine"

// Make it a type alias instead of extending to avoid property conflicts
type Routine = RoutineSnapshot & {
    routine_description: string;
}

interface GeminiAIAnalysisProps {
    onAnalysisComplete: (analysis: AnalysisData['analysis']) => void;
    previousRoutine: RoutineSnapshot | null;
    current_routine: RoutineSnapshot;
    existingAnalysis?: AnalysisData;
}

export async function performGeminiAnalysis(prompt: string) {
    try {
        // Use the correct API key from the environment
        const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY || '')

        // Get the Gemini Pro model
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            generationConfig: {
                maxOutputTokens: 2048,
                temperature: 0.7,
                topP: 0.8,
                topK: 40
            }
        })

        // Generate content
        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        // Clean up the response - remove markdown code blocks and extract the JSON
        let cleanedResponse = text

        // Remove markdown code blocks if present
        if (text.includes('```')) {
            const jsonMatch = text.match(/```(?:json)?([\s\S]*?)```/)
            if (jsonMatch && jsonMatch[1]) {
                cleanedResponse = jsonMatch[1].trim()
            }
        }

        // Try to parse the JSON to ensure it's valid
        try {
            const parsedJson = JSON.parse(cleanedResponse)
            console.log('Valid JSON detected')

            // Return the cleaned JSON string for parsing by the client
            return NextResponse.json({
                analysis: cleanedResponse
            })
        } catch (parseError) {
            console.error('Invalid JSON response:', parseError)
            return NextResponse.json(
                { error: 'The AI generated an invalid JSON response' },
                { status: 400 }
            )
        }
    } catch (error) {
        console.error('Error in Gemini analysis:', error)
        return NextResponse.json(
            { error: 'Failed to analyze routine' },
            { status: 500 }
        )
    }
}

export function GeminiAIAnalysis({
    onAnalysisComplete,
    previousRoutine,
    current_routine,
    existingAnalysis
}: GeminiAIAnalysisProps) {
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const [analysisResult, setAnalysisResult] = useState<AnalysisData['analysis'] | null>(null)

    const hasRoutineChanged = (): boolean => {
        if (!previousRoutine) return true

        const current = current_routine

        // Compare arrays of products
        const isSameDayProducts = current.day_products.length === previousRoutine.day_products.length &&
            current.day_products.every((product, index) => {
                const prevProduct = previousRoutine.day_products[index]
                return product.id === prevProduct.id &&
                    product.brand === prevProduct.brand &&
                    product.name === prevProduct.name &&
                    product.type === prevProduct.type
            })

        const isSameNightProducts = current.night_products.length === previousRoutine.night_products.length &&
            current.night_products.every((product, index) => {
                const prevProduct = previousRoutine.night_products[index]
                return product.id === prevProduct.id &&
                    product.brand === prevProduct.brand &&
                    product.name === prevProduct.name &&
                    product.type === prevProduct.type
            })

        // Compare skin profile arrays
        const isSameSkinType = current.skin_type.length === previousRoutine.skin_type.length &&
            current.skin_type.every((type, i) => type === previousRoutine.skin_type[i])

        const isSameSkinConcerns = current.skin_concerns.length === previousRoutine.skin_concerns.length &&
            current.skin_concerns.every((concern, i) => concern === previousRoutine.skin_concerns[i])

        const isSameClimate = current.climate.length === previousRoutine.climate.length &&
            current.climate.every((climate, i) => climate === previousRoutine.climate[i])

        return !(isSameDayProducts &&
            isSameNightProducts &&
            isSameSkinType &&
            isSameSkinConcerns &&
            isSameClimate)
    }

    const handleAnalyzeClick = () => {
        console.log('handleAnalyzeClick')
        if (!hasRoutineChanged()) {
            console.log('routine has not changed, showing confirm dialog')
            setShowConfirmDialog(true)
        } else {
            console.log('routine has changed, analyzing with Gemini')
            analyzeWithGemini()
        }
    }

    const generatePrompt = (data: RoutineSnapshot): string => {
        const morningProducts = data.day_products
            ?.map(p => `${p.brand} ${p.name} (${p.type}, ingredients: ${p.ingredients?.join(', ') || 'none listed'})`)
            .join('\n') || 'No morning products'

        const eveningProducts = data.night_products
            ?.map(p => `${p.brand} ${p.name} (${p.type}, ingredients: ${p.ingredients?.join(', ') || 'none listed'})`)
            .join('\n') || 'No evening products'

        return `You are a skincare analysis AI. Your task is to analyze a skincare routine and return ONLY valid JSON data.

CRITICAL INSTRUCTIONS:
1. DO NOT include markdown code blocks (like \`\`\`json or \`\`\`) in your response.
2. DO NOT include any explanatory text before or after the JSON.
3. Your response should start with the opening curly brace { and end with the closing curly brace }.
4. Return ONLY the raw JSON object, nothing else.

You must follow the exact format below:

{
    "summary": "Brief overview of the routine analysis",
    "routineAnalysis": {
        "day_products": {
            "products": [],
            "recommendations": ["recommendation 1", "recommendation 2"]
        },
        "night_products": {
            "products": [],
            "recommendations": ["recommendation 1", "recommendation 2"]
        }
    },
    "skinProfile": {
        "skinTypeAnalysis": {
            "dry": "analysis for dry skin",
            "oily": "analysis for oily skin"
        },
        "concernsAnalysis": {
            "acne": "analysis for acne",
            "aging": "analysis for aging"
        },
        "climateConsiderations": ["consideration 1", "consideration 2"]
    },
    "recommendations": {
        "general": ["recommendation 1", "recommendation 2"],
        "productInteractions": ["interaction 1", "interaction 2"],
        "missingProducts": ["missing product 1", "missing product 2"],
        "orderSuggestions": ["order suggestion 1", "order suggestion 2"]
    },
    "scientificSources": [
        {
            "citation": "Full citation",
            "keyFindings": "Brief summary of findings",
            "doi": "DOI if available",
            "link": "URL if available"
        }
    ]
}

Analyze the following routine:
Skin Profile:
- Skin Types: ${data.skin_type?.join(', ') || 'Not specified'}
- Skin Concerns: ${data.skin_concerns?.join(', ') || 'None specified'}
- Climate: ${data.climate?.join(', ') || 'Not specified'}

Morning Routine (${data.day_products?.length || 0} products):
${morningProducts}

Evening Routine (${data.night_products?.length || 0} products):
${eveningProducts}

Your analysis should include:
1. Analysis of product combinations and potential conflicts, including ingredient interactions
2. Suggestions for product order based on molecular weight and pH levels
3. Recommendations for missing essential products based on the skin type and concerns
4. Tips for optimizing the routine based on skin type and concerns
5. Specific advice for the given climate conditions
6. Relevant peer-reviewed scientific sources for your recommendations

REMEMBER: Your response MUST start with '{' and end with '}' - no code blocks, no markdown, just the raw JSON object.`
    }

    const analyzeWithGemini = async () => {
        setIsAnalyzing(true)
        setError(null)
        setShowConfirmDialog(false)

        try {
            console.log('pre-prompt analysis data:', current_routine)
            const prompt = generatePrompt(current_routine)

            const response = await performGeminiAnalysis(prompt)

            if (!response.ok) {
                throw new Error('Failed to get AI analysis')
            } else {
                console.log('AI analysis successful')
            }

            const data = await response.json()

            if (data.error) {
                throw new Error(data.error)
            }

            // Parse the cleaned JSON string into an object
            try {
                const parsedAnalysis = JSON.parse(data.analysis)
                console.log('Successfully parsed analysis:', parsedAnalysis)

                // Validate the parsed data has the required structure
                if (!isValidAnalysis(parsedAnalysis)) {
                    throw new Error('Invalid analysis format - missing required fields')
                }

                // Update the analysis result with the properly formatted data
                const cast_analysis = parsedAnalysis as AnalysisData['analysis']
                setAnalysisResult(parsedAnalysis)

                // Call renderAndSaveAnalysis
                renderAndSaveAnalysis(parsedAnalysis)

                // Pass the formatted analysis to the parent component
                onAnalysisComplete(parsedAnalysis)

            } catch (parseError) {
                console.error('Error parsing AI response:', parseError)
                setError(`Failed to parse AI recommendations: ${parseError.message}`)
                return
            }

        } catch (err) {
            console.error('Error getting AI analysis:', err)
            setError(`Failed to get AI recommendations: ${err.message}`)
        } finally {
            setIsAnalyzing(false)
        }
    }
    // Type guard to validate the analysis structure
    function isValidAnalysis(analysis: AnalysisData['analysis']): analysis is AnalysisData['analysis'] {
        return (
            analysis &&
            typeof analysis.summary === 'string' &&
            analysis.routineAnalysis &&
            analysis.routineAnalysis.day_products &&
            analysis.routineAnalysis.night_products &&
            analysis.skinProfile &&
            analysis.skinProfile.skinTypeAnalysis &&
            analysis.skinProfile.concernsAnalysis &&
            analysis.skinProfile.climateConsiderations &&
            analysis.recommendations &&
            Array.isArray(analysis.recommendations.general) &&
            Array.isArray(analysis.recommendations.productInteractions) &&
            Array.isArray(analysis.recommendations.missingProducts) &&
            Array.isArray(analysis.recommendations.orderSuggestions)
        )
    }

    const saveAnalysisToDatabase = async (analysis, current_routine) => {
        const supabase = createClient()
        console.log('Saving analysis to database:', analysis)
        // Save the analysis to the database
        // Update the database if needed
        const updated_analysis = {
            analysis: analysis,
            timestamp: new Date().toISOString(),
            routineSnapshot: {
                day_products: current_routine.day_products,
                night_products: current_routine.night_products,
                skin_type: current_routine.skin_type,
                skin_concerns: current_routine.skin_concerns,
                climate: current_routine.climate
            }
        }
        const { error } = await supabase
            .from('community_builds')
            .update({ analysis: updated_analysis })
            .eq('id', current_routine.id)

        if (error) {
            console.error('Error saving analysis to database:', error)
        } else {
            console.log('New A.I analysis saved to database')
        }

    }

    const renderAndSaveAnalysis = (analysis: AnalysisData['analysis']) => {
        console.log('RENDER analysis incoming data:', analysis)

        // Save the analysis to the database
        saveAnalysisToDatabase(analysis, current_routine)


        return (
            <div className="mt-4 space-y-4">
                <div className="prose prose-sm max-w-none">
                    <h4 className="font-medium mb-2">{analysis.summary}</h4>

                    <h5 className="font-medium text-sm mt-3">Morning Routine</h5>
                    <ul className="list-disc pl-5">
                        {analysis.routineAnalysis.day_products.recommendations.map((rec, idx) => (
                            <li key={`morning-${idx}`} className="text-sm">{rec}</li>
                        ))}
                    </ul>

                    <h5 className="font-medium text-sm mt-3">Evening Routine</h5>
                    <ul className="list-disc pl-5">
                        {analysis.routineAnalysis.night_products.recommendations.map((rec, idx) => (
                            <li key={`evening-${idx}`} className="text-sm">{rec}</li>
                        ))}
                    </ul>

                    <h5 className="font-medium text-sm mt-3">General Recommendations</h5>
                    <ul className="list-disc pl-5">
                        {analysis.recommendations.general.map((rec, idx) => (
                            <li key={`general-${idx}`} className="text-sm">{rec}</li>
                        ))}
                    </ul>
                </div>

                {analysis.scientificSources && analysis.scientificSources.length > 0 && (
                    <div className="mt-6 border-t pt-4">
                        <h4 className="text-lg font-medium mb-3">Scientific Sources</h4>
                        <div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded-lg">
                            <ul>
                                {analysis.scientificSources.map((source, idx) => (
                                    <li key={`source-${idx}`} className="mb-3">
                                        <p className="font-medium">{source.citation}</p>
                                        <p>Key findings: {source.keyFindings}</p>
                                        {source.link && <a href={source.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View source</a>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    if (!existingAnalysis && !analysisResult) {
        return (
            <div className="mt-4">
                <Button
                    onClick={handleAnalyzeClick}
                    disabled={isAnalyzing}
                    className="w-full"
                >
                    {isAnalyzing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing Routine...
                        </>
                    ) : (
                        "Analyze with AI"
                    )}
                </Button>
            </div>
        )
    }

    // Determine which analysis to display - new one or existing one
    const displayAnalysis = analysisResult || existingAnalysis?.analysis;

    return (
        <div className="mt-4 space-y-4">
            {displayAnalysis && (
                <div className="p-4 border rounded-lg bg-slate-50">
                    <h3 className="font-medium text-lg mb-2">AI Analysis</h3>

                    <div className="prose prose-sm max-w-none">
                        <h4 className="font-medium mb-2">{displayAnalysis.summary}</h4>

                        <h5 className="font-medium text-sm mt-3">Morning Routine</h5>
                        <ul className="list-disc pl-5">
                            {displayAnalysis.routineAnalysis.day_products.recommendations.map((rec, idx) => (
                                <li key={`morning-${idx}`} className="text-sm">{rec}</li>
                            ))}
                        </ul>

                        <h5 className="font-medium text-sm mt-3">Evening Routine</h5>
                        <ul className="list-disc pl-5">
                            {displayAnalysis.routineAnalysis.night_products.recommendations.map((rec, idx) => (
                                <li key={`evening-${idx}`} className="text-sm">{rec}</li>
                            ))}
                        </ul>

                        <h5 className="font-medium text-sm mt-3">General Recommendations</h5>
                        <ul className="list-disc pl-5">
                            {displayAnalysis.recommendations.general.map((rec, idx) => (
                                <li key={`general-${idx}`} className="text-sm">{rec}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Scientific sources section */}
                    {displayAnalysis.scientificSources && displayAnalysis.scientificSources.length > 0 && (
                        <div className="mt-6 border-t pt-4">
                            <h4 className="text-lg font-medium mb-3">Scientific Sources</h4>
                            <div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded-lg">
                                <ul>
                                    {displayAnalysis.scientificSources.map((source, idx) => (
                                        <li key={`source-${idx}`} className="mb-3">
                                            <p className="font-medium">{source.citation}</p>
                                            <p>Key findings: {source.keyFindings}</p>
                                            {source.link && <a href={source.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View source</a>}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <Button
                onClick={handleAnalyzeClick}
                disabled={isAnalyzing}
                variant={displayAnalysis ? "outline" : "default"}
                className="w-full"
            >
                {isAnalyzing ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating New Analysis...
                    </>
                ) : (
                    displayAnalysis ? "Generate New Analysis" : "Analyze with AI"
                )}
            </Button>

            {/* Confirmation Dialog */}
            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>No Changes Detected</AlertDialogTitle>
                        <AlertDialogDescription>
                            Your routine hasn't changed since the last analysis. Are you sure you want to re-analyze it?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={analyzeWithGemini}>Yes, Re-Analyze</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}