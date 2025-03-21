import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: Request) {
    try {
        const { prompt } = await request.json()

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
        console.log('response', response)
        return NextResponse.json({
            analysis: text,
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        })
    } catch (error) {
        console.error('Error in Gemini analysis:', error)
        return NextResponse.json(
            { error: 'Failed to analyze routine' },
            { status: 500 }
        )
    }
} 